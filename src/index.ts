import Discord, {
  AttachmentBuilder,
  Events,
  GatewayIntentBits,
} from "discord.js";
import { token } from "./config.json";

import { scrapeSmilies } from "./smilies";

let smilies: Record<string, string> = {};
let cache: Record<string, Buffer> = {};

const logWithTime = (...args: any[]) => {
  console.log(new Date().toISOString(), "-", ...args);
};

const fetchImage = async (key: string) => {
  try {
    const url = smilies[key];

    if (!url) throw new Error(`no url for key ${key}`);

    const response = await fetch(url);
    const data = await response.arrayBuffer();
    const image = Buffer.from(data);
    cache[key] = image;

    return image;
  } catch (e) {
    console.log(e);
    return undefined;
  }
};

const refreshSmilies = async () => {
  smilies = { ...smilies, ...(await scrapeSmilies()) };
};

const client = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, () => {
  logWithTime("client ready");
});

client.on(Events.MessageCreate, async ({ content, channel }) => {
  const words = content.split(" ");

  words.forEach(async (word) => {
    if (Object.keys(smilies).includes(word)) {
      let image: Buffer | undefined;
      let fileName = smilies[word].split("/").pop() || "";

      if (!cache[word]) {
        image = await fetchImage(word);
      } else {
        image = cache[word];
      }

      if (!image) return;

      try {
        const attachment = new AttachmentBuilder(image, { name: fileName });
        await channel.send({ files: [attachment] });
      } catch (e: any) {
        const error: Error = e;
        logWithTime(error.message);
      }
    }
  });
});

client.on(Events.Error, (error) => {
  logWithTime("ERROR", error);
});

setInterval(() => {
  refreshSmilies();
}, 1000 * 60 * 60 * 24);

refreshSmilies().then(() => {
  client.login(token);
});
