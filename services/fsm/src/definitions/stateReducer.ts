import { FortifyPlayerState } from "@shared/state";
import { Context } from "@shared/auth";

import { PublicPlayerState, PrivatePlayerState } from "../gsiTypes";

export interface StateReducer<T = PublicPlayerState | PrivatePlayerState> {
	name: string;

	processor: (
		state: FortifyPlayerState,
		context: Context,
		publicPlayerState: T,
		timestamp: string,
	) => Promise<FortifyPlayerState>;
}
