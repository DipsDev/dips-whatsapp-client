//TODO:
// add an ability to bypass some numbers in group send and media

import chalk from "chalk";
export const ACTIONS: string[] = [
  "help",
  "send <number> <body>",
  "media <number> <path/url> (body)",
  "group send (index: _ for help) <time between messages, in seconds> <body> (--bypasslist)",
  "group media (index: _ for help) <path/url> <time between messages, in seconds> (body) (--bypasslist)",
];
export const DESCS: string[] = [
  "Shows the help message",
  "Send a private message in chat",
  "Send a media (from url or local)",
  "Send a message to all participants in the chosen group, use --bypasslist if it should bypass number in the txt.",
  "Send a media (from url or local) to all participiants in the chosen group, use --bypasslist if it should bypass number in the txt.",
];

export function printHelpMessage(): void {
  console.log(`${chalk.bgBlueBright("HOW TO USE")}`);
  console.log(chalk.blackBright("<required>, (optional)"));
  ACTIONS.map((v, i) => {
    console.log(`
    - ${v}
     ${chalk.blackBright(DESCS[i])}
    `);
  });
}
