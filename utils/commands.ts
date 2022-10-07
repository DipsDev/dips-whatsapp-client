import { oraPromise } from "ora";
import wwj from "whatsapp-web.js";
import chalk from "chalk";
import {
  sendMessage,
  getGroups,
  sendGroupMessage,
  sendGroupMedia,
  sendMedia,
} from "../server.js";
export async function handleSendMessage(args: string[]) {
  const number = args.shift();
  const body = args.length > 0 ? args.join(" ") : "Hello World from dipsc!";
  console.log(body);
  try {
    await oraPromise(sendMessage(number as string, body), {
      text: "Sending message",
      successText: "Message sent!",
      failText: "Failed to send message!",
    });
  } catch {}
}

export async function handleGroupSend(args: string[]) {
  const command2 = args.shift();
  if (command2 === "send") {
    let chats1;
    try {
      chats1 = await getGroups();
    } catch {
      console.log(chalk.redBright("Failed to fetch groups"));
    } finally {
      const chats = chats1 as wwj.Chat[];
      if (args[0] === "_" || !chats[parseInt(args[0])]) {
        for (let j = 0; j < chats.length; j++) {
          console.log(j, chats[j].name);
        }
      } else {
        let cooldown = !isNaN(+args[1]) ? parseInt(args[1]) : 10;

        try {
          const body = args.slice(2).join(" ");
          await oraPromise(
            sendGroupMessage(
              chats[parseInt(args[0])].id._serialized,
              cooldown,
              body
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
}

function isValidUrlImage(str: string): boolean {
  return (
    (str.indexOf("https") > -1 || str.indexOf("http") > -1) && isImage(str)
  );
}

function isImage(url: string): boolean {
  return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
}

export async function handleGroupMedia(args: string[]) {
  let chats1;
  try {
    chats1 = await getGroups();
  } catch {
    console.log(chalk.redBright("Failed to fetch groups"));
  } finally {
    const chats = chats1 as wwj.Chat[];
    args[0] = !isNaN(+args[0]) ? args[0] : "_";
    if (args[0] === "_" || !chats[parseInt(args[0])]) {
      for (let j = 0; j < chats.length; j++) {
        console.log(j, chats[j].name);
      }
    } else {
      const urlOrLocal = isValidUrlImage(args[1]) ? "url" : "local";
      let cooldown = !isNaN(+args[2]) ? parseInt(args[2]) : 10;
      try {
        const body = args.slice(3).join(" ");
        await oraPromise(
          sendGroupMedia(
            chats[parseInt(args[0])].id._serialized,
            args[1],
            urlOrLocal,
            cooldown,
            body
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

export async function handleMedia(args: string[]) {
  const number = args.shift();
  const path = args.shift();
  const localUrl = isValidUrlImage(path as string) ? "url" : "local";
  const body = args.join(" ");
  await oraPromise(
    sendMedia(number as string, path as string, localUrl, body),
    {
      text: "Sending Media",
      failText: "Failed to send media!",
      successText: "Media was sent successfully!",
    }
  );
}
