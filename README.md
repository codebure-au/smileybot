# smileybot
smileybot will present something awful forums smilies on command

## add smileybot to your server
https://discordapp.com/api/oauth2/authorize?client_id=676338687939706892&permissions=67144704&scope=bot

## commands
refer to the shortcuts at https://forums.somethingawful.com/misc.php?action=showsmilies

## build your own smileybot
* clone this repo
* `cp src/config.sample.ts src/config.ts`
* get a discord bot token and put it in `src/config.ts`
* `docker-compose build`
* `docker-compose up -d`