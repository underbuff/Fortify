import { config } from "dotenv";
config();

import * as debug from "debug";

import { sharedSetup } from "@shared/index";
sharedSetup();

import { container } from "./inversify.config";

import { KafkaConnector } from "@shared/connectors/kafka";

import { StateReducer } from "./definitions/stateReducer";
import { CommandReducer } from "./definitions/commandReducer";

import { verify } from "jsonwebtoken";

import { Log, PublicPlayerState, PrivatePlayerState } from "./gsiTypes";
import { Context } from "@shared/auth";
import { FortifyFSMCommand } from "@shared/state";

import { StateTransformationService } from "./services/stateTransformer";

const { JWT_SECRET, KAFKA_FROM_START } = process.env;

(async () => {
	const kafka = container.get(KafkaConnector);

	// Get state transformer service
	const stateTransformer = container.get(StateTransformationService);

	// Get all reducers
	const commandReducers = container.getAll<CommandReducer>("command");
	const publicStateReducers = container.getAll<
		StateReducer<PublicPlayerState>
	>("public");
	const privateStateReducers = container.getAll<
		StateReducer<PrivatePlayerState>
	>("private");

	const consumer = kafka.consumer({ groupId: "fsm-group" });

	await consumer.subscribe({
		fromBeginning: KAFKA_FROM_START === "true" ?? false,
		topic: "gsi",
	});

	await consumer.subscribe({
		topic: "fsm-commands",
	});

	await consumer.run({
		autoCommit: KAFKA_FROM_START !== "true" ?? true,
		eachMessage: async ({ message, topic }) => {
			const value = message.value.toString();

			if (topic === "fsm-commands") {
				const command: FortifyFSMCommand = JSON.parse(value);

				let state = await stateTransformer.loadState(command.steamid);

				for (const commandReducer of commandReducers) {
					state = await commandReducer.processor(state, command);
				}

				await stateTransformer.saveState(state, command.steamid);
			}

			if (topic === "gsi") {
				try {
					const gsi: Log = JSON.parse(value);
					const jwt = verify(gsi.auth, JWT_SECRET ?? "");

					if (jwt instanceof Object) {
						const context = jwt as Context;

						let state = await stateTransformer.loadState(
							context.user.id,
						);

						for (const { data } of gsi.block) {
							for (const {
								public_player_state,
								private_player_state,
							} of data) {
								if (public_player_state) {
									for (const reducer of publicStateReducers) {
										state = await reducer.processor(
											state,
											context,
											public_player_state,
										);
									}
								}

								if (private_player_state) {
									for (const reducer of privateStateReducers) {
										state = await reducer.processor(
											state,
											context,
											private_player_state,
										);
									}
								}
							}
						}

						await stateTransformer.saveState(
							state,
							context.user.id,
						);
					}
				} catch (e) {
					debug("app::consumer:eachMessage")(e);
				}
			}
		},
	});
})().catch(debug("app::anonymous_function"));