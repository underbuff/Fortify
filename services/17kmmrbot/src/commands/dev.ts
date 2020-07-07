import { injectable, inject } from "inversify";
import debug = require("debug");

import { ChatUserstate, Client } from "tmi.js";

import { TwitchCommand } from "../definitions/twitchCommand";
import { KafkaConnector } from "@shared/connectors/kafka";
import { ExtractorService } from "../services/extractor";

import { FortifyFSMCommand, FortifyFSMCommandType } from "@shared/state";

@injectable()
export class DevCommands implements TwitchCommand {
	constructor(
		@inject(KafkaConnector) private kafka: KafkaConnector,
		@inject(ExtractorService) private extractorService: ExtractorService,
	) {}

	invocations = ["!reset", "!join"];

	authorized = async (_channel: string, tags: ChatUserstate) =>
		tags.badges?.broadcaster === "1" ||
		tags["display-name"]?.toLocaleLowerCase() === "greycodes";

	handler = async (
		client: Client,
		channel: string,
		tags: ChatUserstate,
		message: string,
	) => {
		try {
			const isAdmin =
				tags["display-name"]?.toLocaleLowerCase() === "greycodes";

			const { steamid } = await this.extractorService.getUser(channel);

			const msg = message.trim().toLocaleLowerCase();

			if (msg === "!reset") {
				const producer = this.kafka.producer();
				await producer.connect();

				const command: FortifyFSMCommand = {
					steamid,
					type: FortifyFSMCommandType.RESET,
				};

				await producer.send({
					messages: [{ value: JSON.stringify(command) }],
					topic: "fsm-commands",
				});

				client.say(
					channel,
					tags["display-name"] + " reset command sent",
				);
			}

			if (isAdmin && msg.startsWith("!join")) {
				try {
					const channelName = msg.substr(5, msg.length).trim();

					await client.join(channelName);

					await client.whisper(
						tags["display-name"]?.toLocaleLowerCase() ??
							"greycodes",
						"Joined " + channelName,
					);
				} catch (e) {
					await client.whisper(
						tags["display-name"]?.toLocaleLowerCase() ??
							"greycodes",
						"An error occurred: " + e.toString(),
					);
				}
			}
		} catch (e) {
			debug("app::devCommands")(e);
		}
	};
}
