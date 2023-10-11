import { TwitchCommand } from "definitions/twitchCommand";
import { Client } from "tmi.js";
import { injectable } from "inversify";

@injectable()
export class CreditsCommand implements TwitchCommand {
	invocations = ["!credit", "!underbuff"];

	handler = async (client: Client, channel: string) => {
		client.say(
			channel,
			"Check out https://underbuff.gg & https://github.com/underbuff/Fortify",
		);
	};
}
