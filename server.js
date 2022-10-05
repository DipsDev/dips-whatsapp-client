import pkg from "whatsapp-web.js";
const { Client, LocalAuth, MessageMedia } = pkg;
import qrcode from "qrcode-terminal";
import ora from "ora";
import { printHelpMessage } from "./utils/values.js";
import { initClient } from "./index.js";
export const server = new Client({
  authStrategy: new LocalAuth(),
});

const startingSpinner = ora("Starting server");

// number required: 972556668191 - without the +

server.on("qr", (qr) => {
  startingSpinner.text = "Waiting for authentication";
  qrcode.generate(qr, { small: true });
});

server.on("ready", () => {
  startingSpinner.text = "Done";
  startingSpinner.succeed();
  printHelpMessage();
  initClient();
});

export var sendMessage = async (number, body) => {
  try {
    const ID = await server.getNumberId(number);
    await server.sendMessage(ID._serialized, body);
  } catch (err) {
    throw err;
  }
};

export var sendMedia = async (number, path, local_url, body) => {
  const ID = server.getNumberId(number);
  if (local_url === "local") {
    const MEDIA = MessageMedia.fromFilePath(path);
    let data = [await ID, MEDIA];
    return await server.sendMessage(data[0]._serialized, data[1], {
      caption: body,
    });
  }
  const MEDIA = MessageMedia.fromUrl(path);
  const data = await Promise.all([ID, MEDIA]);
  return await server.sendMessage(data[0]._serialized, data[1], {
    caption: body,
  });
};

export var getGroups = async () => {
  var i = await (await server.getChats()).filter((chat) => chat.isGroup);
  return i;
};

export var sendGroupMedia = async (
  groupid,
  path,
  local_url,
  cooldown,
  body
) => {
  var group = await server.getChatById(groupid);
  if (local_url === "local") {
    const media = MessageMedia.fromFilePath(path);
    return group.participants.forEach(async (participant) => {
      if (participant.id.user == server.info.wid.user) return;
      const contact = await server.getChatById(participant.id._serialized);
      await sleep(cooldown * 1000);
      await contact.sendMessage(media, { caption: body });
    });
  } else {
    const media = await MessageMedia.fromUrl(path);
    return group.participants.forEach(async (participant) => {
      if (participant.id.user == server.info.wid.user) return;
      const contact = await server.getChatById(participant.id._serialized);
      await contact.sendMessage(media, { caption: body });
    });
  }
};

export var sendGroupMessage = async (groupid, cooldown, body) => {
  try {
    var group = await server.getChatById(groupid);

    for (let i = 0; i < group.participants.length; i++) {
      if (group.participants[i].id.user == server.info.wid.user) return;
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

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export var startServer = (should_disconnect) => {
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
