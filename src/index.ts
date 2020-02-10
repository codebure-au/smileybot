import axios from "axios"
import { discordOptions } from "./config"
import Discord from "discord.io"

interface List<T> {
  [key: string]: T
}

let smilies: List<string> = {}
let cache: List<Buffer> = {}

const logWithTime = (string: string) => {
  console.log(new Date().toISOString(), '-', string)
}

const scrapeSmilies = async () => {
  try {
    const url = `https://forums.somethingawful.com/misc.php?action=showsmilies`
    const response = await axios.get(url)

    const lines = (response.data as string).split("\n")

    let dictionary: List<string> = {}
    
    lines.forEach((line, index) => {
      const regex = /^<li class="smilie">$/

      if (regex.test(line)) {
        const textLine = lines[index + 1]
        const imageLine = lines[index + 2]
        const textRegex = /^ ?<div class="text">(:.*)<\/div>$/
        const imageRegex = /^ ?<img alt=".*" src="(https\:\/\/.*)" title=".*">$/

        if (!textRegex.test(textLine) || !imageRegex.test(imageLine)) return

        const textMatch = textLine.match(textRegex)
        const imageMatch = imageLine.match(imageRegex)
        if (!textMatch || !imageMatch) return

        const keyword = textMatch[1]
        const file = imageMatch[1]

        dictionary[keyword] = file
      }
    })

    return dictionary
  } catch (e) {
    console.log('error fetching smilies', e)
    return {}
  }
}

const fetchImage = async (key: string) => {
  try {
    const url = smilies[key]

    if (!url) throw new Error(`no url for key ${key}`)

    const response = await axios.get(url, { responseType: "arraybuffer" })
    const image = Buffer.from(response.data, 'binary')
    cache[key] = image

    return image
  } catch (e) {
    console.log(e)
    return undefined
  }
}

const getClient = async () => {
  smilies = await scrapeSmilies()
  const keys = Object.keys(smilies)

  const bot = new Discord.Client(discordOptions)

  bot.on('connect', () => logWithTime('connected'))
  bot.on('disconnect', () => {
    logWithTime('disconnected')

    setTimeout(() => {
      bot.connect()
    }, 5000)
  })

  bot.on('ready', () => logWithTime(`logged in as ${bot.username} - ${bot.id}`))

  bot.on('message', async (user, userID, channelID, message, event) => {
    const words = message.split(" ")

    words.forEach(async (word) => {
      if (keys.includes(word)) {
        let image: Buffer | undefined
        let filename = (smilies[word].split("/").pop() || "")

        if (!cache[word]) {
          image = await fetchImage(word)
        } else {
          image = cache[word]
        }

        if (!image) return

        try {
          bot.uploadFile({
            to: channelID,
            file: image,
            filename
          }, () => {
            logWithTime(`sent smilie ${word}`)
          })
        } catch (e) {
          console.log(e)
        }
      }
    })
  })
}

getClient()

setTimeout(() => {
  logWithTime('ending script for the day')
  process.exit()
}, 1000 * 60 * 60 * 24)