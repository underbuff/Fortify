import { config } from "dotenv";
config();

import debug from "debug";

import { sharedSetup } from "@shared/index";
sharedSetup();

import { container } from "./inversify.config";

import yargs from "yargs";
import { FortifyScript } from "./scripts";
import { RedisConnector } from "@shared/connectors/redis";

yargs
	.command(
		"run [script]",
		"run the specified script",
		(_yargs) => {
			return _yargs.positional("script", {
				describe: "script to run",
				default: "dummy",
				type: "string",
			});
		},
		async (argv) => {
			debug("app::run")(argv);

			if (container.isBound(argv.script)) {
				const fortifyScript = container.get<FortifyScript>(argv.script);

				await fortifyScript.handler();
			} else {
				debug("app::run")("No matching script found");
			}

			// Close connections to gracefully complete
			container.get(RedisConnector).client.quit();
		},
	)
	.showHelpOnFail(true)
	.help("help", "Show help on failure")
	.demandCommand()
	.recommendCommands()
	.strict().argv;
