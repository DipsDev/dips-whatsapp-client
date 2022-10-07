#!/usr/bin/env node

import { Command } from "commander";
import { Subject } from "rxjs";
import inquirer from "inquirer";
import chalk from "chalk";
import { printHelpMessage } from "./utils/values.js";
import {
  handleGroupMedia,
  handleGroupSend,
  handleSendMessage,
} from "./utils/commands.js";

import { startServer } from "./server.js";

const program = new Command();
const prompts = new Subject<any>();
export function initClient() {
  prompts.next(makePrompt(null));
}
function makePrompt(msg: string | null) {
  return {
    type: "input",
    name: `userInput-${i}`,
    message: `${msg || "Type your first command!"}\n\n`,
  };
}

let i = 0;
inquirer.prompt(prompts).ui.process.subscribe(
  async ({ answer }): Promise<void> => {
    if (answer !== "") {
      i++;
      const args = answer.split(" ");
      const command = args.shift();
      if (command == "send") {
        await handleSendMessage(args);
      } else if (command === "help") {
        printHelpMessage();
      } else if (command === "group") {
        const command2 = args.shift();
        if (command2 === "send") {
          await handleGroupSend(args);
        } else if (command2 === "media") {
          await handleGroupMedia(args);
        }
      } else if (command === "media") {
        await handleGroupMedia(args);
      }
      prompts.next(makePrompt(`>>>`));
    } else {
      prompts.complete();
    }
  },
  () => {
    console.log("Error occured");
  },
  () => {
    console.log(chalk.green("Session closed."));
  }
);

program
  .name("Dips client")
  .description("CLI to do some whatsapp commands.")
  .version("0.8.0");

program
  .command("start")
  .description("Start the whatsapp client")
  .option(
    "--dis, --disconnect",
    "Disconnect from the previous connected client"
  )
  .action((options) => {
    startServer(options.disconnect);
  });

program.parse();
