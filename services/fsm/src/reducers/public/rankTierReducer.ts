import { StateReducer } from "../../definitions/stateReducer";
import { PublicPlayerState } from "../../gsiTypes";
import { FortifyPlayerState } from "@shared/state";
import { Context } from "@shared/auth";
import { injectable, inject } from "inversify";

import { RankTierUpdateEvent } from "@shared/events/gameEvents";
import { EventService } from "@shared/services/eventService";
import { StateTransformationService } from "../../services/stateTransformer";

@injectable()
export class RankTierReducer implements StateReducer<PublicPlayerState> {
	name = "RankTierReducer";

	constructor(
		@inject(EventService) private eventService: EventService,
		@inject(StateTransformationService)
		private stateTransformationService: StateTransformationService,
	) {}

	async processor(
		state: FortifyPlayerState,
		context: Context,
		publicPlayerState: PublicPlayerState,
	) {
		const { account_id, rank_tier } = publicPlayerState;

		const accountID = account_id.toString();

		if (
			state.lobby.players[accountID] &&
			!state.lobby.players[accountID].rankTier
		) {
			state.lobby.players[accountID].rankTier = rank_tier;

			if (rank_tier > 0) {
				const rankTierUpdate = new RankTierUpdateEvent(
					accountID,
					rank_tier,
				);
				await this.eventService.sendEvent(
					rankTierUpdate,
					`user-${state.steamid}`,
				);
			}

			await this.stateTransformationService.saveState(
				state,
				state.steamid,
			);
		}

		return state;
	}
}