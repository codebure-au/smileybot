import axios from "axios";
import Discord from "discord.js";
import { token } from "./config.json";

import { scrapeSmilies, notAnimated } from "./smilies";

let smilies: Record<string, string> = {};
let cache: Record<string, Buffer> = {};

const logWithTime = (...args: any[]) => {
  console.log(new Date().toISOString(), "-", ...args);
};

const fetchImage = async (key: string) => {
  try {
    const url = smilies[key];

    if (!url) throw new Error(`no url for key ${key}`);

    const response = await axios.get(url, { responseType: "arraybuffer" });
    const image = Buffer.from(response.data, "binary");
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

const client = new Discord.Client();

client.on("ready", () => {
  logWithTime("client ready");
});

client.on("message", async ({ content, channel }) => {
  const words = content.split(" ");

  words.forEach(async (word) => {
    if (Object.keys(smilies).includes(word)) {
      let image: Buffer | undefined;
      let fileName = smilies[word].split("/").pop() || "";
      if (notAnimated.includes(word))
        fileName = fileName.replace(".gif", ".png"); //this removes the gif selector popup in discord ui

      if (!cache[word]) {
        image = await fetchImage(word);
      } else {
        image = cache[word];
      }

      if (!image) return;

      try {
        const attachment = new Discord.MessageAttachment(image, fileName);
        await channel.send(attachment);
      } catch (e) {
        logWithTime(e);
      }
    }
  });
});

client.on("error", (error) => {
  logWithTime("ERROR", error);
});

client.setInterval(() => {
  refreshSmilies();
}, 1000 * 60 * 60 * 24);

refreshSmilies().then(() => {
  client.login(token);
});
