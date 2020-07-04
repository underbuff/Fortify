import debug = require("debug");

import { injectable, inject } from "inversify";
import { TwitchCommand } from "../definitions/twitchCommand";
import { PostgresConnector } from "@shared/connectors/postgres";

import { Client } from "tmi.js";

import { ExtractorService } from "../services/extractor";

import { FortifyGameMode } from "@shared/state";
import { LeaderboardService } from "../services/leaderboard";
import { ULLeaderboard, LeaderboardType } from "../definitions/leaderboard";

@injectable()
export class NotablePlayersCommand implements TwitchCommand {
	constructor(
		@inject(PostgresConnector) private db: PostgresConnector,
		@inject(ExtractorService) private extractorService: ExtractorService,
		@inject(LeaderboardService)
		private leaderboardService: LeaderboardService,
	) {}

	invocations = ["!np"];

	handler = async (client: Client, channel: string) => {
		try {
			const user = await this.extractorService.getUser(channel);

			// Fetch fortify player state by steamid
			const fps = await this.extractorService.getPlayerState(
				user.steamid,
			);

			if (!fps) {
				return client.say(
					channel,
					"No player state found for " + user.name,
				);
			}

			// TODO: Refactor the following to be more efficient when querying data from postgres

			const gameMode = await this.extractorService.getGameMode(fps);

			// TODO: Refactor this to not re-fetch the leaderboard every time
			// TODO: Create CRON job fetching the leaderboard
			// TODO: Insert this into the postgres
			// TODO: Fetch the corresponding entries by username instead of fetching the leaderboard and then filter

			let leaderboard: ULLeaderboard | null = null;

			if (gameMode === FortifyGameMode[FortifyGameMode.Normal]) {
				leaderboard = await this.leaderboardService.fetchLeaderboard(
					LeaderboardType.Standard,
				);
			} else if (gameMode === FortifyGameMode[FortifyGameMode.Turbo]) {
				leaderboard = await this.leaderboardService.fetchLeaderboard(
					LeaderboardType.Turbo,
				);
			} else if (gameMode === FortifyGameMode[FortifyGameMode.Duos]) {
				leaderboard = await this.leaderboardService.fetchLeaderboard(
					LeaderboardType.Duos,
				);
			}

			const averageMMR = await this.extractorService.getAverageMMR(
				fps,
				leaderboard,
			);

			let response = `${gameMode} [${averageMMR} avg MMR]: `;

			// Get players and sort them by leaderboard rank
			const players = Object.values(fps.lobby.players).sort((a, b) =>
				(a.global_leaderboard_rank ?? 0) >
				(b.global_leaderboard_rank ?? 0)
					? 1
					: (b.global_leaderboard_rank ?? 0) >
					  (a.global_leaderboard_rank ?? 0)
					? -1
					: 0,
			);

			for (const player of players) {
				try {
					const {
						name,
						rank,
						mmr,
					} = await this.extractorService.getPlayer(
						player,
						leaderboard,
					);

					if (rank > 0) {
						response += `${name} [Rank: ${rank}, MMR: ${mmr}], `;
					}
				} catch (e) {
					continue;
				}
			}
			response = response.slice(0, -2);

			client.say(channel, response);
		} catch (e) {
			client.say(channel, "Something went wrong");
			debug("app::notablePlayers")(e);
		}

		return;
	};
}
