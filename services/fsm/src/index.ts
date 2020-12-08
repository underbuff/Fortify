import { config } from "dotenv";
config();

import debug from "debug";

import { sharedSetup } from "@shared/index";
global.__rootdir__ = __dirname || process.cwd();
sharedSetup();

import { captureException, flush } from "@sentry/node";

import { container } from "./inversify.config";

import { KafkaConnector } from "@shared/connectors/kafka";

import { CommandReducer } from "./definitions/commandReducer";

import { Log } from "@shared/definitions/gsiTypes";
import { Context } from "@shared/definitions/context";

import { StateService } from "./services/state";

import { FortifyEventTopics, FortifyEvent } from "@shared/events/events";
import { SystemEventType } from "@shared/events/systemEvents";
import { ConsumerCrashEvent } from "kafkajs";
import { Secrets } from "./secrets";
import { HealthCheck } from "@shared/services/healthCheck";
import { MatchProcessor } from "./processors/match";
import { FortifyGameMode, UserCacheKey } from "@shared/state";

const {
	KAFKA_FROM_START,
	KAFKA_START_OFFSET,
	KAFKA_START_OFFSET_PARTITION = "0",
	KAFKA_AUTO_COMMIT,
	KAFKA_GROUP_ID = "fsm-group",
} = process.env;

(async () => {
	await container.get(Secrets).getSecrets();

	const healthCheck = container.get(HealthCheck);
	await healthCheck.start();

	const kafka = container.get(KafkaConnector);

	// Get state transformer service
	const stateService = container.get(StateService);
	// Get match processor
	const matchProcessor = container.get(MatchProcessor);

	// Get all reducers
	const commandReducers = container.getAll<CommandReducer>("command");

	const consumer = kafka.consumer({ groupId: KAFKA_GROUP_ID });

	await consumer.subscribe({
		fromBeginning: KAFKA_FROM_START === "true" ?? false,
		topic: "gsi",
	});

	await consumer.subscribe({
		topic: FortifyEventTopics.SYSTEM,
	});

	await consumer.run({
		autoCommit: KAFKA_AUTO_COMMIT !== "false" ?? true,
		eachMessage: async ({ message, topic, partition }) => {
			if (!message.value) {
				return;
			}

			const value = message.value.toString();

			if (topic === FortifyEventTopics.SYSTEM) {
				const event: FortifyEvent<SystemEventType> = JSON.parse(value);
				const steamid = event["steamid"] as string | null;

				if (steamid) {
					for (const commandReducer of commandReducers) {
						await commandReducer.processor(event);
					}
				}
			}

			if (topic === "gsi") {
				try {
					const gsi: Log = JSON.parse(value);
					const ctx = gsi.auth;

					if (ctx instanceof Object) {
						const context = ctx as Pick<Context, "user">;

						// Get source account id
						const {
							user: { id },
						} = context;

						for (const block of gsi.block) {
							// Get matchID for source account
							const matchID = await stateService.getUserMatchID(
								id,
							);

							// Is matchID set?
							if (matchID) {
								// Fetch match data using matchID
								const matchData = await stateService.getMatch(
									matchID,
								);
								// Check if gsi block contains same users & slots as in match data
								const containsSameUsers = block.data.reduce<boolean>(
									(acc, data) => {
										// If the accumulator was assigned a false value
										// propagate it to the result
										if (!acc) return acc;

										const { public_player_state } = data;

										if (public_player_state) {
											const {
												account_id,
												player_slot,
											} = public_player_state;

											if (
												!matchData?.players[account_id]
											) {
												// Could not find player in match data
												return false;
											}

											if (
												matchData.players[account_id]
													.public_player_state
													.player_slot !== player_slot
											) {
												// In this case we have a previously known account but in a different slot
												return false;
											}
										}

										// In this case we probably dealt with a private player state datum
										return acc;
									},
									true,
								);

								if (containsSameUsers && matchData) {
									// Proceed to processing match data
									return matchProcessor.process({
										matchState: matchData,
										sourceAccountID: id,
										timestamp: gsi.timestamp,
										block,
									});
								} else {
									// Unset matchID cache for source account
									stateService.resetUserCache(
										id,
										UserCacheKey.matchID,
									);
								}
							} else {
								// TODO: Calculate new matchID
								const newMatchID: string | null = "123";

								// As matchID calculation happens over a period of time
								// the newMatchID is going to be null until information
								// of all 8 players is received
								if (newMatchID) {
									await stateService.setUserMatchID(
										id,
										newMatchID,
									);

									let matchData = await stateService.getMatch(
										newMatchID,
									);

									if (!matchData) {
										// TODO: Create initialized match object
										matchData = {
											id: newMatchID,
											updateCount: 0,
											averageMMR: 0,
											created: 0,
											mode: FortifyGameMode.Normal,
											players: {},
											pool: {},
											updated: 0,
										};

										await stateService.setMatch(
											newMatchID,
											matchData,
										);
									}

									return matchProcessor.process({
										matchState: matchData,
										sourceAccountID: id,
										timestamp: gsi.timestamp,
										block,
									});
								}
							}
						}
					}
				} catch (e) {
					debug("app::consumer::run")(e);
					const exceptionID = captureException(e, {
						contexts: {
							kafka: {
								topic,
								partition,
								message: JSON.stringify(message, null, 2),
							},
						},
					});
					debug("app::consumer::run")(exceptionID);
					throw e;
				}
			}
		},
	});

	if (KAFKA_START_OFFSET) {
		consumer.seek({
			offset: KAFKA_START_OFFSET,
			partition: parseInt(KAFKA_START_OFFSET_PARTITION),
			topic: "gsi",
		});
	}

	consumer.on("consumer.disconnect", () => {
		debug("app::kafka::consumer.disconnect")("Consumer disconnected");
		// const sentryID = captureMessage("Consumer disconnected");
		// debug("app::kafka::consumer.disconnect")(sentryID);
	});
	consumer.on("consumer.connect", () => {
		debug("app::kafka::consumer.connect")("Consumer connected");
		// const sentryID = captureMessage("Consumer connected");
		// debug("app::kafka::consumer.connect")(sentryID);
	});
	consumer.on("consumer.crash", async (crashEvent: ConsumerCrashEvent) => {
		debug("app::kafka::consumer.crash")(crashEvent);
		const sentryID = captureException(crashEvent.payload.error, {
			extra: {
				groupId: crashEvent.payload.groupId,
			},
		});
		debug("app::kafka::consumer.crash")(sentryID);
		try {
			await flush();
		} finally {
			// eslint-disable-next-line no-process-exit
			process.exit(-1);
		}
	});

	healthCheck.live = true;
})().catch((e) => {
	debug("app::anonymous_function")(e);
	captureException(e);

	// eslint-disable-next-line no-process-exit
	process.exit(-1);
});
