import { createHash } from "crypto";
import { injectable, inject } from "inversify";
import { PostgresConnector } from "../connectors/postgres";
import { Match } from "../db/entities/match";
import { MatchSlot } from "../db/entities/matchSlot";
import { AverageMMRCalculationProps, ExtractorService } from "./extractor";
import { FortifyGameMode, MatchState } from "../state";
import { LeaderboardService } from "./leaderboard";
import { LeaderboardType } from "../definitions/leaderboard";
import { currentSeason } from "../season";
import { User } from "../db/entities/user";
import { GetPlayerSummaries } from "../definitions/playerSummaries";
import fetch from "node-fetch";
import { convert32to64SteamId } from "../steamid";
import {
	MatchStartedEvent,
	MatchFinalPlaceEvent,
	MatchEndedEvent,
} from "../events/gameEvents";
import { SecretsManager } from "./secrets";
import { Logger } from "../logger";
import { RedisConnector } from "../connectors/redis";

export interface MatchServicePlayer {
	accountID: string;
	slot: number;

	name: string;

	finalPlace: number;

	rankTier?: number;
	globalLeaderboardRank?: number;
}

export const matchIDGenerator = (
	players: readonly MatchServicePlayer[],
	nonce = 0,
) => {
	const sortedPlayers = [...players].sort((a, b) => a.slot - b.slot);

	const lobbyString =
		sortedPlayers.map((player) => player.accountID).join("") + nonce;

	return createHash("sha256").update(lobbyString).digest("base64");
};

@injectable()
export class MatchService {
	constructor(
		@inject(PostgresConnector) private postgres: PostgresConnector,
		@inject(ExtractorService) private extractorService: ExtractorService,
		@inject(LeaderboardService)
		private leaderboardService: LeaderboardService,
		@inject(SecretsManager)
		private secrets: SecretsManager<{
			steamWebApi: {
				apiKey: string;
			};
		}>,
		@inject(Logger) private logger: Logger,
		@inject(RedisConnector) private redis: RedisConnector,
	) {}

	async generateMatchID(players: MatchServicePlayer[]) {
		const matchRepo = await this.postgres.getMatchRepo();

		// If a player has no finalPlace, set it to zero
		for (const player of players) {
			if (!player.finalPlace) {
				player.finalPlace = 0;
			}
		}

		let matchID = "";
		let match: Match | undefined = undefined;
		let nonce = -1;

		let foundMatchID = false;

		do {
			// Check if matchID already is in DB
			nonce += 1;
			// Generate ID based on steamid and slot
			matchID = matchIDGenerator(players, nonce);
			match = await matchRepo?.findOne(matchID, {
				relations: ["slots", "slots.user"],
			});

			if (match) {
				// If such an ID already exists, check wether it's potentially the same match or another match

				// It's the same match if:
				// - finalPlaces are the same / update missing finalPlaces

				// Iterate on finalPlaces of passed players and compare with matchSlots of player / user
				// If the finalPlace is not the same for a user (in case of an already set finalPlace), the entire players array check can be discarded and we are dealing with a new match
				const finalPlacesUpdatable = players.reduce(
					(acc, { accountID, slot, finalPlace }) => {
						// If at one point we realize that one slot is not updatable, skip checking the rest of the lobby
						if (!acc) return false;

						const matchSlot = match?.slots.find(
							(matchSlot) =>
								matchSlot.slot === slot &&
								matchSlot.user?.steamid === accountID,
						);

						// No match slot could be found for said user
						if (!matchSlot) return false;

						const matchSlotUpdatable =
							// If the finalPlace in the match slot is unset and the finalPlace of said user transmitted
							(matchSlot.finalPlace === 0 && finalPlace >= 0) ||
							// If we already have a finalPlace stored, then the passed finalPlace has to be the same
							(matchSlot.finalPlace > 0 &&
								matchSlot.finalPlace === finalPlace);

						return acc && matchSlotUpdatable;
					},
					true,
				);

				// It's the same match if:
				// - if it's withing the same hour as match start or the hour before match start
				//   - here we are assuming that match times are at max an hour.
				// 	 --> Should this ever change in the future, then this match id generation mechanic is broken
				// Check wether the match start time is equal to the current full hour or last full hour
				const currentDate = new Date().getHours();
				const currentHours = [
					currentDate,
					currentDate === 0 ? 23 : currentDate - 1,
				];

				const matchStartHour = match.created.getHours();
				// Create a time window of full hours +/-1 match start hour
				const startHours = [
					matchStartHour === 23 ? 0 : matchStartHour + 1,
					matchStartHour,
					matchStartHour === 0 ? 23 : matchStartHour - 1,
				];

				const insideMatchStartTimeWindow = currentHours.reduce(
					(acc, currentHour) =>
						acc || startHours.includes(currentHour),
					false,
				);

				// If it's a different game, increase the nonce by one and repeat the steps from above until either the correct match id has been found
				foundMatchID =
					finalPlacesUpdatable && insideMatchStartTimeWindow;
			} else {
				// If no match was found, we have a fresh match id
				foundMatchID = true;
			}
		} while (!foundMatchID);

		return matchID;
	}

	async storeMatchStart(event: MatchStartedEvent) {
		const { matchID, players, gameMode, timestamp } = event;

		try {
			if (!matchID) {
				this.logger.warn(
					"No matchID set in MatchStartedEvent; Skipping event",
					{ event },
				);
				return;
			}

			const matchRepo = await this.postgres.getMatchRepo();

			// In case we receive the match started event multiple times
			const dbMatch = await matchRepo?.findOne(matchID);
			if (dbMatch) {
				return;
			}

			const match = new Match();
			match.id = matchID;
			match.gameMode = gameMode;
			match.slots = [];
			match.season = currentSeason;
			match.created = timestamp;
			match.updated = timestamp;

			const playerRecord = players.map<AverageMMRCalculationProps>(
				({ globalLeaderboardRank, rankTier }) => ({
					global_leaderboard_rank: globalLeaderboardRank,
					rank_tier: rankTier,
				}),
			);

			if (
				gameMode === FortifyGameMode.Normal ||
				gameMode === FortifyGameMode.Turbo ||
				gameMode === FortifyGameMode.Duos
			) {
				const leaderboard = await this.leaderboardService.fetchLeaderboard(
					gameMode === FortifyGameMode.Normal
						? LeaderboardType.Standard
						: gameMode === FortifyGameMode.Turbo
						? LeaderboardType.Turbo
						: LeaderboardType.Duos,
				);
				match.averageMMR = parseInt(
					await this.extractorService.getAverageMMR(
						playerRecord,
						leaderboard,
						null,
					),
				);
			}

			const matchSlotRepo = await this.postgres.getMatchSlotRepo();

			// For each player in the lobby
			for (const {
				accountID,
				slot,
				finalPlace,
				name,
				globalLeaderboardRank,
				rankTier,
			} of players) {
				let matchSlot = await matchSlotRepo?.findOne({
					where: { match, slot },
				});

				if (!matchSlot) {
					matchSlot = new MatchSlot();
					// Link their slot to a match
					matchSlot.match = match;
					// Save their slot
					matchSlot.slot = slot;
				}

				// Save their finalPlace
				matchSlot.finalPlace = finalPlace;

				matchSlot.created = timestamp;
				matchSlot.updated = timestamp;

				const user = await this.getOrCreateUser(
					accountID,
					timestamp,
					name,
					gameMode,
					globalLeaderboardRank,
					rankTier,
				);

				matchSlot.user = user;
				match.slots.push(matchSlot);
			}

			await matchRepo?.save(match);
		} catch (e) {
			this.logger.error("Store match start event failed", { e, event });
			this.logger.error(e as string, { event });

			throw e;
		}
	}

	private async getOrCreateUser(
		accountID: string,
		timestamp: Date,
		name: string,
		gameMode?: FortifyGameMode,
		globalLeaderboardRank?: number,
		rankTier?: number,
	) {
		try {
			const userRepo = await this.postgres.getUserRepo();
			let user = await userRepo?.findOne(accountID);
			if (!user) {
				user = new User();
				user.steamid = accountID;

				user.created = timestamp;
			}
			user.name = name;
			user.updated = timestamp;

			if (gameMode === FortifyGameMode.Normal) {
				user.standardRating = { ...user.standardRating };

				if (globalLeaderboardRank) {
					user.standardRating.rank = globalLeaderboardRank;
				}
				if (rankTier) {
					user.standardRating.rankTier = rankTier;
				}
			} else if (gameMode === FortifyGameMode.Turbo) {
				user.turboRating = { ...user.turboRating };

				if (globalLeaderboardRank) {
					user.turboRating.rank = globalLeaderboardRank;
				}
				if (rankTier) {
					user.turboRating.rankTier = rankTier;
				}
			} else if (gameMode === FortifyGameMode.Duos) {
				user.duosRating = { ...user.duosRating };

				if (globalLeaderboardRank) {
					user.duosRating.rank = globalLeaderboardRank;
				}
				if (rankTier) {
					user.duosRating.rankTier = rankTier;
				}
			}

			try {
				const {
					steamWebApi: { apiKey },
				} = await this.secrets.getSecrets();

				// TODO: Refactor this to be one request getting all 8 images instead of 8 requests getting one image
				// Fetch image from steam web api
				const playerSummariesRaw = await fetch(
					`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${convert32to64SteamId(
						accountID,
					)}`,
				);
				try {
					const playerSummaries = await (playerSummariesRaw.json() as Promise<GetPlayerSummaries>);
					if (playerSummaries.response.players.length > 0) {
						const player = playerSummaries.response.players[0];
						user.profilePicture = player.avatarfull;
					}
				} catch (e) {
					this.logger.error("Steam Web API image request failed", {
						e,
					});
					this.logger.error(e);

					playerSummariesRaw
						.text()
						.then((text) =>
							this.logger.error("Web API response", { text }),
						)
						.catch((e) => this.logger.error(e));
				}
			} catch (e) {
				this.logger.error("Steam Web API image request failed", { e });
				this.logger.error(e);
			}

			return userRepo?.save(user);
		} catch (e) {
			this.logger.error("Get or create user failed", { e });
			this.logger.error(e);
			throw e;
		}
	}

	async storeFinalPlace(event: MatchFinalPlaceEvent) {
		const { matchID, steamID, finalPlace, timestamp } = event;

		try {
			if (!matchID) {
				this.logger.error(
					"No matchID set in MatchFinalPlaceEvent. Skipping event",
					{ event },
				);
				return;
			}

			const matchRepo = await this.postgres.getMatchRepo();

			let match = await matchRepo?.findOne(matchID, {
				relations: ["slots", "slots.user"],
			});

			if (match) {
				match.slots = match.slots.reduce<MatchSlot[]>((acc, slot) => {
					if (slot.user?.steamid === steamID) {
						slot.finalPlace = finalPlace;
						slot.updated = timestamp;
					}

					acc.push(slot);

					return acc;
				}, []);
			} else {
				match = new Match();

				match.id = matchID;
				match.created = timestamp;
				await matchRepo?.save(match);

				const user = await this.getOrCreateUser(steamID, timestamp, "");

				const matchSlot = new MatchSlot();
				matchSlot.created = timestamp;
				matchSlot.updated = timestamp;
				matchSlot.finalPlace = finalPlace;
				matchSlot.user = user;
				matchSlot.match = match;
				// As the slot is a 4 bytes integer in the db, we're going to create a random number in said range
				// This will hopefully save us from clashing compound primary key collisions
				matchSlot.slot = Math.floor(
					(Math.random() >= 0.5 ? 1 : -1) *
						Math.random() *
						2147483647,
				);

				match.slots = [matchSlot];
			}

			match.updated = timestamp;

			return matchRepo?.save(match);
		} catch (e) {
			this.logger.error(
				"An exception occurred while storing a final place. Skipping event",
				{ e, event },
			);
			this.logger.error(e);
			throw e;
		}
	}

	async storeMatchEnd(event: MatchEndedEvent) {
		const { matchID, timestamp } = event;
		try {
			if (!matchID) {
				this.logger.error(
					"No matchID set in MatchEndedEvent; Skipping event",
					{ event },
				);
				return;
			}

			const matchRepo = await this.postgres.getMatchRepo();

			let match = await matchRepo?.findOne(matchID, {
				relations: ["slots", "slots.user"],
			});

			if (match) {
				match.slots = match.slots.reduce<MatchSlot[]>((acc, slot) => {
					if (!slot.finalPlace) {
						slot.finalPlace = 1;
						slot.updated = timestamp;
					}

					acc.push(slot);

					return acc;
				}, []);
			} else {
				match = new Match();
				match.id = matchID;
				match.slots = [];
			}

			match.updated = timestamp;
			match.ended = timestamp;

			return matchRepo?.save(match);
		} catch (e) {
			this.logger.error(
				"An exception occurred while storing a match end. Skipping event",
				{ e, event },
			);
			this.logger.error(e);
			throw e;
		}
	}

	async getMatchFromRedis(id: string) {
		const rawMatch = await this.redis.getAsync(`match:${id}`);

		if (!rawMatch) {
			this.logger.debug(`No match found in cache for: ${id} `);
			return null;
		}

		const matchState: MatchState = JSON.parse(rawMatch);

		return matchState;
	}
}
