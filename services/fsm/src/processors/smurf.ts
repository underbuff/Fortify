import { injectable } from "inversify";
import { Block } from "@shared/definitions/gsiTypes";
import { MatchState } from "@shared/state";
import { EventService } from "@shared/services/eventService";
import { SmurfDetectedEvent } from "@shared/events/gameEvents";

// In order to avoid circular dependencies, I'm declaring a separate interface
export interface SmurfDetectorProps {
	matchState: MatchState;
	block: Block;
	sourceAccountID: string;
	timestamp: string;
}

@injectable()
export class SmurfDetector {
	constructor(public eventService: EventService) {}

	async process({
		block,
		matchState,
		sourceAccountID,
		timestamp,
	}: SmurfDetectorProps): Promise<MatchState> {
		// If we receive a private player state for
		// a different account than the source account ID
		// it's safe to say that someone is logged into a smurf account

		for (const { private_player_state } of block.data) {
			if (private_player_state) {
				const { player_slot } = private_player_state;
				const publicPlayerState = Object.values(matchState.players)
					.map((p) => p.public_player_state)
					.find((p) => p.player_slot === player_slot);

				if (
					publicPlayerState &&
					publicPlayerState.account_id.toString() !== sourceAccountID
				) {
					// Only send smurf detected event once per match for each potential account
					if (!matchState.players[sourceAccountID].smurfDetected) {
						const smurfDetectedEvent = new SmurfDetectedEvent(
							sourceAccountID,
							publicPlayerState.account_id.toString(),
						);
						smurfDetectedEvent.timestamp = new Date(timestamp);
						await this.eventService.sendEvent(
							smurfDetectedEvent,
							`match-${matchState.id}`,
						);

						matchState.players[
							sourceAccountID
						].smurfDetected = true;
					}
				}
			}
		}

		return matchState;
	}
}
