import chalk from "chalk";
export const ACTIONS = [
  "help",
  "send <number> <body>",
  "media <number> <path/url> <local/url> (body)",
  "group send (index: _ for help) <time between messages, in seconds> <body>",
  "group media (index: _ for help) <path/url> <local/url> <time between messages, in seconds> (body)",
];
export const DESCS = [
  "Shows the help message",
  "Send a private message in chat",
  "Send a media (from url or local)",
  "Send a message to all participants in the chosen group",
  "Send a media (from url or local) to all participiants in the chosen group",
];

export function printHelpMessage() {
  console.log(`\n${chalk.bgBlueBright("HOW TO USE")}`);
  console.log(chalk.blackBright("<required>, (optional)"));
  ACTIONS.map((v, i) => {
    console.log(`
    - ${v}
     ${chalk.blackBright(DESCS[i])}
    `);
  });
}
