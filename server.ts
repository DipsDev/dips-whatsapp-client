import pkg from "whatsapp-web.js";
const { Client, LocalAuth, MessageMedia } = pkg;
import qrcode from "qrcode-terminal";
import ora from "ora";
import { printHelpMessage } from "./utils/values.js";
import { initClient } from "./index.js";
export const server = new Client({
  authStrategy: new LocalAuth(),
});

let neededQr = false;
const startingSpinner = ora("Starting server");
const waitingForAuthSpinner = ora("Waiting for authentication");

// number required: 972556668191 - without the +

server.on("qr", (qr): void => {
  startingSpinner.succeed();
  waitingForAuthSpinner.start();
  neededQr = true;

  qrcode.generate(qr, { small: true });
});

server.on("ready", (): void => {
  if (!neededQr) {
    startingSpinner.text = "Done";
    startingSpinner.succeed();
  } else {
    waitingForAuthSpinner.text = "authenticated";
    waitingForAuthSpinner.succeed();
  }
  printHelpMessage();
  initClient();
});

export var sendMessage = async (number: string, body: string) => {
  try {
    const id = await server.getNumberId(number);
    await server.sendMessage(id?._serialized as string, body);
  } catch (err) {
    throw err;
  }
};

export var sendMedia = async (
  number: string,
  path: string,
  local_url: string,
  body: string
) => {
  try {
    if (local_url !== "local") {
      const id = server.getNumberId(number);
      const media = MessageMedia.fromUrl(path);
      const data = await Promise.all([id, media]);
      return await server.sendMessage(data[0]?._serialized as string, data[1], {
        caption: body,
      });
    } else {
      const id = await server.getNumberId(number);
      const media = MessageMedia.fromFilePath(path);
      await server.sendMessage(id?._serialized as string, media, {
        caption: body,
      });
    }
  } catch (err) {
    throw err;
  }
};

export var getGroups = async () => {
  var i = await (await server.getChats()).filter((chat) => chat.isGroup);
  return i;
};

export var sendGroupMedia = async (
  groupid: string,
  path: string,
  local_url: string,
  cooldown: number,
  body: string
) => {
  var chat = await server.getChatById(groupid);
  const group = chat as pkg.GroupChat;

  try {
    if (local_url === "local") {
      const media = MessageMedia.fromFilePath(path);
      for (let i = 0; i < group.participants.length; i++) {
        if (group.participants[i].id.user === server.info.wid.user) continue;
        const contact = await server.getChatById(
          group.participants[i].id._serialized
        );
        await sleep(cooldown * 1000 * i);
        await contact.sendMessage(media, { caption: body });
      }
    } else {
      const media = await MessageMedia.fromUrl(path);
      for (let i = 0; i < group.participants.length; i++) {
        if (group.participants[i].id.user === server.info.wid.user) continue;
        const contact = await server.getChatById(
          group.participants[i].id._serialized
        );
        await sleep(cooldown * 1000 * i);
        await contact.sendMessage(media, { caption: body });
      }
    }
  } catch (err) {
    throw err;
  }
};

export var sendGroupMessage = async (
  groupid: string,
  cooldown: number,
  body: string
) => {
  try {
    var chat = await server.getChatById(groupid);
    const group = chat as pkg.GroupChat;

    for (let i = 0; i < group.participants.length; i++) {
      if (group.participants[i].id.user == server.info.wid.user) continue;
      const contact = await server.getChatById(
        group.participants[i].id._serialized
      );
      await sleep(cooldown * 1000 * i);
      await contact.sendMessage(body);
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export var startServer = (should_disconnect: boolean) => {
  startingSpinner.start();
  if (should_disconnect) {
    server.logout();
  }
  server.initialize();
  setTimeout(() => {
    startingSpinner.color = "yellow";
    startingSpinner.text = "Powering up";
  }, 10000);
};
