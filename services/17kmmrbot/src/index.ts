import "reflect-metadata";

import * as dotenv from "dotenv";
dotenv.config();
import debug = require("debug");

import { Client, Options } from "tmi.js";

import { container } from "./inversify.config";
import { PostgresConnector } from "@shared/connectors/postgres";
import { KafkaConnector } from "@shared/connectors/kafka";
import { KafkaTopic17kmmrbot } from "@shared/17kmmrbot";

import { TwitchCommand } from "./definitions/twitchCommand";
import { BotCommandProcessor } from "./services/command";

import { sharedSetup } from "@shared/index";
sharedSetup();

const { KAFKA_FROM_START } = process.env;

(async () => {
	const commands = container.getAll<TwitchCommand>("command");

	const postgres = container.get(PostgresConnector);
	const userRepo = await postgres.getUserRepo();
	const channels = await (await userRepo.find({ select: ["twitch_name"] }))
		.map((channel) => channel.twitch_name ?? "")
		.filter((value) => value);

	const commandProcessor = container.get(BotCommandProcessor);
	const kafka = container.get(KafkaConnector);
	const consumer = kafka.consumer({ groupId: "17kmmrbot-group" });

	consumer.subscribe({
		fromBeginning: KAFKA_FROM_START !== "true" ?? true,
		topic: KafkaTopic17kmmrbot,
	});

	const options: Options = {
		channels,
		connection: {
			reconnect: true,
			secure: true,
		},
		identity: {
			password: process.env.OAUTH_TOKEN,
			username: process.env.BOT_USERNAME,
		},
	};

	const client = Client(options);

	process.on("SIGTERM", shutDown);
	process.on("SIGINT", shutDown);

	async function shutDown() {
		try {
			(await postgres.connection).close();
			debug("app::main")("Postgres connection closed");
			await consumer.disconnect();
			debug("app::main")("Kafka consumer closed");
			await client.disconnect();
			debug("app::main")("Twitch connection closed");
		} finally {
			debug("app::shutdown")(
				"Received kill signal, shutting down gracefully",
			);

			// eslint-disable-next-line no-process-exit
			process.exit(0);
		}
	}

	await consumer.run({
		autoCommit: KAFKA_FROM_START !== "true" ?? true,
		eachMessage: async (payload) =>
			commandProcessor.process(payload, client),
	});

	client.on("message", async (channel, tags, message, self) => {
		try {
			// Ignore echoed messages.
			if (self) return;

			for (const command of commands) {
				const invoked = command.invocations.reduce(
					(acc, invocation) =>
						acc ||
						message
							.toLowerCase()
							.startsWith(invocation.toLowerCase()),
					false,
				);

				if (invoked) {
					const timedOut =
						command.timeout !== undefined
							? await command.timeout(channel, tags, message)
							: false;

					const authorized =
						command.authorized !== undefined
							? await command.authorized(channel, tags, message)
							: true;

					if (!timedOut && authorized) {
						await command.handler(client, channel, tags, message);
					}
				}
			}
		} catch (e) {
			debug("app::message")(e);
		}
	});

	const connected = await client.connect();

	debug("app::main")("Twitch bot connected");
	debug("app::main")(connected);
})().catch(debug("app::main"));