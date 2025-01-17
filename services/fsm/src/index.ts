import { config } from "dotenv";
config();

import { sharedSetup } from "@shared/index";
global.__rootdir__ = __dirname || process.cwd();
sharedSetup();

//import { captureException, flush } from "@sentry/node";

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
import { MatchService, MatchServicePlayer } from "@shared/services/match";
import { MatchProcessor } from "./processors/match";
import { UserCacheKey } from "@shared/state";
import { Connector } from "@shared/definitions/connector";
import { Logger } from "@shared/logger";
import { MetricsService, servicePrefix } from "@shared/services/metrics";

import { Summary } from "prom-client";

const {
	KAFKA_FROM_START,
	KAFKA_START_OFFSET,
	KAFKA_START_OFFSET_PARTITION = "0",
	KAFKA_AUTO_COMMIT = "true",
	KAFKA_GROUP_ID = "fsm-group",

	KAFKA_HEARTBEAET_INTERVAL = "3000",
	KAFKA_AUTO_COMMIT_INTERVAL = "5000",
	KAFKA_AUTO_COMMIT_THRESHOLD = "100",
	KAFKA_EACH_BATCH_AUTO_RESOLVE = "false",
} = process.env;

(async () => {
	const logger = container.get(Logger);

	await container.get(Secrets).getSecrets();

	await Promise.all(
		container
			.getAll<Connector>("connector")
			.map((connector) => connector.connect()),
	);

	const healthCheck = container.get(HealthCheck);
	await healthCheck.start();

	const metrics = container.get(MetricsService);
	await metrics.start();

	const messageSummary = new Summary({
		name: `${servicePrefix}_processed_messages`,
		help: "Summary of duration & outcomes of processed kafka messages",
		registers: [metrics.register],
		labelNames: ["topic", "status"],
		maxAgeSeconds: 600,
		ageBuckets: 5,
	});

	const kafka = container.get(KafkaConnector);

	// Get state service
	const stateService = container.get(StateService);
	// Get match processor
	const matchProcessor = container.get(MatchProcessor);
	// Get match service
	const matchService = container.get(MatchService);

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
		autoCommit: KAFKA_AUTO_COMMIT !== "false",
		autoCommitInterval:
			KAFKA_AUTO_COMMIT_INTERVAL === "undefined"
				? undefined
				: parseInt(KAFKA_AUTO_COMMIT_INTERVAL),
		autoCommitThreshold:
			KAFKA_AUTO_COMMIT_THRESHOLD === "undefined"
				? undefined
				: parseInt(KAFKA_AUTO_COMMIT_THRESHOLD),
		eachBatchAutoResolve: KAFKA_EACH_BATCH_AUTO_RESOLVE !== "false",
		eachBatch: async ({
			batch,
			resolveOffset,
			heartbeat,
			commitOffsetsIfNecessary,
			isRunning,
			isStale,
		}) => {
			await heartbeat();
			const intervalId = setInterval(async () => {
				try {
					if (isRunning()) {
						logger.debug("Sending heartbeat");
						await heartbeat();
						logger.debug("Sent heartbeat");
					} else {
						clearInterval(intervalId);
					}
				} catch (e) {
					logger.error("Failed to send heartbeat to Kafka", { e });
					logger.error(e);
				}
			}, parseInt(KAFKA_HEARTBEAET_INTERVAL));

			logger.debug("Processing batch");

			const { messages, topic, partition } = batch;

			for (const message of messages) {
				if (!isRunning() || isStale()) break;

				const end = messageSummary.labels({ topic }).startTimer();

				if (!message.value) {
					end({ topic, status: 404 });
					continue;
				}

				try {
					const value = message.value.toString();

					if (topic === FortifyEventTopics.SYSTEM) {
						const event: FortifyEvent<SystemEventType> = JSON.parse(
							value,
						);
						const steamid = event["steamid"] as string | null;

						if (steamid) {
							for (const commandReducer of commandReducers) {
								await commandReducer.processor(event);
							}
						}

						end({ status: 200 });
					} else if (topic === FortifyEventTopics.GSI) {
						const gsi: Log = JSON.parse(value);
						const ctx = gsi.auth;

						if (ctx instanceof Object) {
							// Get source account id
							const {
								user: { id },
							} = ctx as Pick<Context, "user">;

							for (const block of gsi.block) {
								// Get matchID for source account
								let matchID = await stateService.getUserMatchID(
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

											const {
												public_player_state,
											} = data;

											if (public_player_state) {
												const {
													account_id,
													player_slot,
												} = public_player_state;

												if (
													!matchData?.players[
														account_id
													]
												) {
													// Could not find player in match data
													return false;
												}

												if (
													matchData.players[
														account_id
													].public_player_state
														.player_slot !==
													player_slot
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
										await matchProcessor.process({
											matchState: matchData,
											sourceAccountID: id,
											timestamp: gsi.timestamp,
											block,
										});
									} else {
										// Clean user cache
										await stateService.resetUserCache(
											id,
											UserCacheKey.cache,
										);
										logger.debug("Reset user cache", {
											id,
										});
										// Unset matchID cache for source account
										await stateService.resetUserCache(
											id,
											UserCacheKey.matchID,
										);
										matchID = null;
										logger.debug("Reset user matchID", {
											id,
										});
									}
								}

								if (!matchID) {
									const cache = await stateService.getUserCache(
										id,
									);

									const utcTimestamp = new Date().getTime();

									if (!cache.created) {
										cache.created = utcTimestamp;
									}
									cache.updated = utcTimestamp;

									for (const {
										public_player_state,
									} of block.data) {
										if (public_player_state) {
											const {
												account_id,
											} = public_player_state;

											if (account_id) {
												cache.players[account_id] = {
													id: account_id.toString(),
													public_player_state,
												};
											}
										}
									}
									await stateService.setUserCache(id, cache);

									let newMatchID: string | null = null;

									// Calculate new matchID once we have collected more than 8 players
									if (Object.keys(cache.players).length > 7) {
										// Check if we have received data from a duos lobby
										const hasDuosData = Object.values(
											cache.players,
										).reduce(
											(acc, player) =>
												acc ||
												player.public_player_state
													.player_slot > 8,
											false,
										);

										const matchServicePlayers: MatchServicePlayer[] = Object.values(
											cache.players,
										).map(
											({
												public_player_state: {
													account_id,
													final_place,
													persona_name,
													player_slot,
												},
											}) => ({
												accountID: account_id.toString(),
												finalPlace: final_place,
												name: persona_name,
												slot: player_slot,
											}),
										);

										if (hasDuosData) {
											if (
												Object.keys(cache.players)
													.length > 15
											) {
												newMatchID = await matchService.generateMatchID(
													matchServicePlayers,
												);
											}
										} else {
											// In case it's not a duos match and more players have been cached
											if (
												Object.keys(cache.players)
													.length > 8
											) {
												// Reset user cache
												await stateService.resetUserCache(
													id,
													UserCacheKey.cache,
												);
												logger.debug(
													"Reset user cache",
													{
														id,
													},
												);
											} else {
												newMatchID = await matchService.generateMatchID(
													matchServicePlayers,
												);
											}
										}
									}

									// As matchID calculation happens over a period of time
									// the newMatchID is going to be null until information
									// of all players is received
									if (newMatchID) {
										await stateService.setUserMatchID(
											id,
											newMatchID,
										);
										await stateService.resetUserCache(
											id,
											UserCacheKey.cache,
										);

										let matchData = await stateService.getMatch(
											newMatchID,
										);

										if (!matchData) {
											matchData = {
												id: newMatchID,
												updateCount: 0,
												created: utcTimestamp,
												updated: utcTimestamp,
												players: cache.players,
											};

											await stateService.storeMatch(
												newMatchID,
												matchData,
											);
										}

										await matchProcessor.process({
											matchState: matchData,
											sourceAccountID: id,
											timestamp: gsi.timestamp,
											block,
										});
									}
								}
							}
						}

						end({ status: 200 });
					} else {
						end({ status: 501 });
					}

					resolveOffset(message.offset);
					await commitOffsetsIfNecessary();
				} catch (e) {
					end({ status: 500 });
					/*const exceptionID = captureException(e, {
						contexts: {
							kafka: {
								topic,
								partition,
								message: JSON.stringify(message, null, 2),
							},
						},
					});*/
					logger.error("Consumer run failed", {
						e,
						//exceptionID,
						contexts: {
							kafka: {
								topic,
								partition,
								message: JSON.stringify(message, null, 2),
							},
						},
					});
					/*logger.error(e, {
						exceptionID,
					});*/
					clearInterval(intervalId);
					throw e;
				}
			}

			logger.debug("Finished processing batch");

			clearInterval(intervalId);
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
		logger.warn("Kafka consumer disconnected");
		// const sentryID = captureMessage("Consumer disconnected");
		// debug("app::kafka::consumer.disconnect")(sentryID);
	});
	consumer.on("consumer.connect", () => {
		logger.info("Kafka consumer connected");
		// const sentryID = captureMessage("Consumer connected");
		// debug("app::kafka::consumer.connect")(sentryID);
	});
	consumer.on("consumer.crash", async (crashEvent: ConsumerCrashEvent) => {
		/*const exceptionID = captureException(crashEvent.payload.error, {
			extra: {
				groupId: crashEvent.payload.groupId,
			},
		});*/
		logger.error("Kafka consumer crashed", {
			crashEvent,
			//exceptionID,
		});

		try {
			//await flush(10000);
		} finally {
			// eslint-disable-next-line no-process-exit
			process.exit(-1);
		}
	});

	healthCheck.live = true;

	process.on("SIGTERM", shutDown);
	process.on("SIGINT", shutDown);

	async function shutDown() {
		//await flush(10000).catch(() => {});

		setTimeout(() => {
			logger.warn(
				"Could not close connections in time, forcefully shutting down",
			);
			// eslint-disable-next-line no-process-exit
			process.exit(1);
		}, 10000);

		try {
			await consumer.stop();
			await consumer.disconnect();

			logger.info("Received kill signal, shutting down gracefully");
			// eslint-disable-next-line no-process-exit
			process.exit(0);
		} finally {
			logger.info("Received kill signal, finally shutting down");
		}
	}
})().catch((e) => {
	const logger = container.get(Logger);

	//const exceptionID = captureException(e);

	/*logger.error(e, {
		exceptionID,
	});

	flush(10000)
		.catch(() => {})
		// eslint-disable-next-line no-process-exit
		.finally(() => process.exit(-1));*/
});
