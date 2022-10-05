#!/usr/bin/env node

import { Command } from "commander";
import { Subject } from "rxjs";
import inquirer from "inquirer";
import chalk from "chalk";
import wwj from "whatsapp-web.js";
import { oraPromise } from "ora";
import { printHelpMessage } from "./utils/values.js";

import {
  getGroups,
  sendGroupMedia,
  sendGroupMessage,
  sendMedia,
  sendMessage,
  startServer,
} from "./server.js";

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
        const number = args.shift();
        const body =
          args.length != 0 ? args.join(" ") : "Hello World from dipsc!";
        try {
          await oraPromise(sendMessage(number, body), {
            text: "Sending message",
            successText: "Message sent!",
            failText: "Failed to send message!",
          });
        } catch {}
      } else if (command === "help") {
        printHelpMessage();
      } else if (command === "group") {
        const command2 = args.shift();
        if (command2 === "send") {
          let chats1;
          try {
            chats1 = await getGroups();
          } catch {
            console.log(chalk.redBright("Failed to fetch groups"));
          } finally {
            const chats = chats1 as wwj.Chat[];
            if (args[0] === "_" || !chats[args[0]]) {
              for (let j = 0; j < chats.length; j++) {
                console.log(j, chats[j].name);
              }
            } else {
              let cooldown = !isNaN(args[1]) ? args[1] : 10;
              try {
                await oraPromise(
                  sendGroupMessage(
                    chats[args[0]].id._serialized,
                    cooldown,
                    args.slice(2).join(" ")
                  ),
                  {
                    text: "Sending messages to the group's participants",
                    failText: "Failed to send messages!",
                    successText: "Messages were sent successfully!",
                  }
                );
              } catch {}
            }
          }
        } else if (command2 === "media") {
          let chats1;
          try {
            chats1 = await getGroups();
          } catch {
            console.log(chalk.redBright("Failed to fetch groups"));
          } finally {
            const chats = chats1 as wwj.Chat[];
            if (args[0] === "_") {
              for (let j = 0; j < chats.length; j++) {
                console.log(j, chats[j].name);
              }
            } else {
              args[2] =
                args[2] === "local" || args[2] === "url" ? args[2] : "url";
              let cooldown = !isNaN(args[3]) ? args[3] : 10;
              try {
                await oraPromise(
                  sendGroupMedia(
                    chats[args[0]].id._serialized,
                    args[1],
                    args[2],
                    cooldown,
                    args.slice(4).join(" ")
                  ),
                  {
                    text: "Sending messages to the group's participants",
                    failText: "Failed to send messages!",
                    successText: "Messages were sent successfully!",
                  }
                );
              } catch {}
            }
          }
        }
      } else if (command === "media") {
        const number = args.shift();
        const path = args.shift();
        const localUrl =
          args[0] == "local" || args[0] == "url" ? args.shift() : "url";
        const body = args.join(" ");
        await oraPromise(sendMedia(number, path, localUrl, body), {
          text: "Sending Media",
          failText: "Failed to send media!",
          successText: "Media was sent successfully!",
        });
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
