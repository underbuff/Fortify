import { injectable, inject } from "inversify";
import { FortifyGameMode, FortifyPlayerState } from "@shared/state";

import { Context } from "@shared/auth";

import { PublicPlayerState } from "../../gsiTypes";
import { StateReducer } from "../../definitions/stateReducer";
import { StateTransformationService } from "../../services/stateTransformer";
import { MatchService } from "@shared/services/match";

import {
	MatchStartedEvent,
	MatchFinalPlaceEvent,
	MatchEndedEvent,
} from "@shared/events/gameEvents";
import { EventService } from "@shared/services/eventService";
import { ExtractorService } from "@shared/services/extractor";
import { LeaderboardService } from "@shared/services/leaderboard";
import { LeaderboardType } from "@shared/definitions/leaderboard";

@injectable()
export class LobbyPlayerReducer implements StateReducer<PublicPlayerState> {
	constructor(
		@inject(StateTransformationService)
		private sts: StateTransformationService,
		@inject(MatchService) private matchService: MatchService,
		@inject(EventService) private eventService: EventService,
		@inject(ExtractorService) private extractorService: ExtractorService,
		@inject(LeaderboardService)
		private leaderboardService: LeaderboardService,
	) {}

	name = "LobbyPlayerReducer";

	async processor(
		state: FortifyPlayerState,
		context: Context,
		publicPlayerState: PublicPlayerState,
		timestamp: string,
	) {
		// TODO: Find a reliable way to detect a new game

		/* 	Scenarios when a new game has been started:
		- public information about a level 1 player / lower level than existing in player state
		- additional player ids exceeding the 8 playing (not sure how this is going to work with spectators & duos though)
		- all boards are empty
		*/

		// TODO: Find a reliable way to detect when a new game has been started being spectated

		const {
			account_id,
			player_slot,
			final_place,
			health,
			level,
			persona_name,
			global_leaderboard_rank,
		} = publicPlayerState;

		const accountID = account_id.toString();
		const playerIDs = Object.keys(state.lobby.players);

		// Checking wether a level 1 information has been received and the player state object contains more than 8 player information
		// Gonna use <= comparator as I'm not sure wether levels start at 1 or 0
		if (level <= 1 && playerIDs.length > 7) {
			state = this.sts.resetState(state);
			await this.sts.saveState(state, state.steamid);
		}

		// If we receive a new account id that we didn't have before and we already have 8 account ids, reset the state
		if (!playerIDs.includes(accountID) && playerIDs.length > 7) {
			state = this.sts.resetState(state);
			await this.sts.saveState(state, state.steamid);
		}

		if (state.lobby.mode === FortifyGameMode.Invalid) {
			// For now we are only going to detect wether the match started is standard or KO
			// If we get 100 hp, we can be sure that the game mode is standard

			// This of course doesn't work if we start spectating a game that is mid way
			// I'll assume that everything is going to be standard for now until match data can get forwarded from GSI

			// if (health === 100) {
			state.lobby.mode = FortifyGameMode.Normal;
			// }

			// TODO: Find out how health is tracked for KO and Duos

			// This will also only work if someone has started a new KO game
			if (level === 1 && health === 4) {
				state.lobby.mode = FortifyGameMode.Turbo;
			}
		}

		// Once we receive a new final place, send the corresponding event
		// A new final place = it wasn't stored previously in the player lobby state
		if (
			state.lobby.id &&
			final_place > 0 &&
			state.lobby.players[accountID] &&
			state.lobby.players[accountID].finalPlace !== final_place
		) {
			const finalPlaceEvent = new MatchFinalPlaceEvent(
				state.lobby.id,
				accountID,
				final_place,
			);
			finalPlaceEvent.timestamp = new Date(timestamp);
			await this.eventService.sendEvent(
				finalPlaceEvent,
				`userid-${accountID}`,
			);
		}

		state.lobby.players[accountID] = {
			...(state.lobby.players[accountID]
				? state.lobby.players[accountID]
				: {}),
			accountID,
			finalPlace: final_place,
			globalLeaderboardRank: global_leaderboard_rank,
			name: persona_name ?? "",
			slot: player_slot,
		};

		// If we have 8 player, send the match started event, if we didn't create a match id yet
		if (
			Object.keys(state.lobby.players).length > 7 &&
			!state.lobby.id &&
			// Gotta Flex Tape(tm) this
			// Apparently we can receive "random" or "old" public player objects with the same slots
			// Not really great but w/e
			// TODO: Look for an actual solution to this
			Object.values(state.lobby.players)
				.map((player) => player.slot)
				.sort()
				.every((value, index) => value === index + 1)
		) {
			const lobbyPlayers = Object.values(state.lobby.players).map(
				({
					accountID,
					slot,
					finalPlace,
					globalLeaderboardRank,
					name,
				}) => ({
					accountID,
					slot,
					finalPlace,
					globalLeaderboardRank,
					name,
				}),
			);

			const matchID = await this.matchService.generateMatchID(
				lobbyPlayers,
			);

			// Store match id
			state.lobby.id = matchID;

			// Store average mmr
			const leaderboardType =
				state.lobby.mode === FortifyGameMode.Normal
					? LeaderboardType.Standard
					: state.lobby.mode === FortifyGameMode.Turbo
					? LeaderboardType.Turbo
					: state.lobby.mode === FortifyGameMode.Duos
					? LeaderboardType.Duos
					: undefined;
			const leaderboard = await this.leaderboardService.fetchLeaderboard(
				leaderboardType,
			);
			state.lobby.averageMMR = parseFloat(
				this.extractorService.getAverageMMR(
					state.lobby.players,
					leaderboard,
					null,
				),
			);

			// Store creation date
			const now = new Date();
			state.lobby.created =
				now.getTime() + now.getTimezoneOffset() * 60000;

			await this.sts.saveState(state, state.steamid);

			const newMatchEvent = new MatchStartedEvent(
				matchID,
				lobbyPlayers,
				state.lobby.mode,
			);
			newMatchEvent.timestamp = new Date(timestamp);

			await this.eventService.sendEvent(
				newMatchEvent,
				`userid-${state.steamid}`,
			);
		}

		// Once a person gets first place, the match is completed
		if (final_place === 2 && state.lobby.id) {
			const matchEndedEvent = new MatchEndedEvent(state.lobby.id);
			matchEndedEvent.timestamp = new Date(timestamp);
			await this.eventService.sendEvent(
				matchEndedEvent,
				`userid-${state.steamid}`,
			);

			const now = new Date();
			state.lobby.ended = now.getTime() + now.getTimezoneOffset() * 60000;
		}

		return state;
	}
}
