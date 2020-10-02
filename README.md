# Discord bot
[![Discord](https://img.shields.io/discord/658113349384667198.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/8g6zUQu)
![GitHub repo size](https://img.shields.io/github/repo-size/Spiderjockey02/Discord-Bot)
![Website](https://img.shields.io/website?down_color=red&down_message=offline&up_color=green&up_message=online&url=http%3A%2F%2F86.25.177.233%2F)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/Spiderjockey02/Discord-Bot)

[Invite link](https://discord.com/oauth2/authorize?response_type=code&client_id=647203942903840779&permissions=8&scope=bot)
## Features
* Music
  * Supports music formats from [Youtube](https://www.youtube.com/), [Spotify](https://www.spotify.com/) & [Soundcloud](https://www.soundcloud.com). (more to come soon)
  * Search from lyrics provided by [KSOFT.API](https://api.ksoft.si/).
  * Ability to bassboost your music.
  * Loop queue and/or song.
  * A total of **18** commands.
* Moderation
  * Clear (purge) messages.
  * Ban, Kick & Warn misbehaving members.
  * Auto-moderation feature.
  * Change nicknames of other members.
  * Report and ticket system implemented.
  * A total of **11** commands.
* Ranking System
  * Gain XP from sending messages.
  * XP multiplier.
  * Exempt Channels and/or roles from gaining XP.
  * Leaderboard system implemented.
* Logging system
  * Log member leave/join
  * Channel create, delete & update.
  * Role create, delete & update.
  * Emoji create, delete & update.
  * Member (un)bans.
  * Member updates. (nickname, role)
  * Message (un)reactions.
  * Message update & deletion.
  * A total of **20** events.
* Fun / Miscellaneous
  * Look up profile stats on Fortnite, Rainbow 6, steam & instagram.
  * Search for random images, memes & facts.
  * Flip a coin.
  * Random number generator.
  * Look up facts about pokemon.
  * Get some random advice.
  * Play some mingigames:
   - Rock, Paper, Scissor.
   - More to come soon.
  * A total of **23** commands.
* Image
  * Create fake captcha, clyde, Pornhub comments & twitter tweets.
  * Create QR codes.
  * Look at pictures of dogs and cats.
  * A total of **8** commands.
* NSFW
  * coming soon
## Upcoming features
* Currently working on a shiny new dashboard (updates to repo will be slowed down while this happens).

**Overall there are over 80 commands.
All these plugins are very easy to set-up and are full with options to make your server stand out and unique.**
## Self hosting the bot
Want to host the bot yourself, if not [invite him](https://discord.com/oauth2/authorize?response_type=code&client_id=647203942903840779&permissions=8&scope=bot)?
### Installation

First of all, make sure you have downloaded:
 * [Node.js](https://nodejs.org/en/). (Version 12 or higher)
 * NPM (Normally comes with Node.js)
 * [MongoDB](https://www.mongodb.com/) (This can be a local server or one hosted by them)
 * [git](https://git-scm.com/) (optional).

Now, clone this repository by
downloading or running the command `git clone https://github.com/Spiderjockey02/Discord-Bot.git`.

Next run the following commands:
```
$ cd Discord-Bot
$ npm install
$ npm start
```
This will install all the correct dependecies needed to run the bot.

### Setting up the bot

Fill out `config.example.js` with the correct information and then rename it to `config.js`.

**Dashboard Setup**
It is recommended to run the dashboard with a proxy (like Nginx)
#### Nginx Configuration
```
server {
    listen 80;

    server_name dashboard.bot-website.com;

    location / {
        proxy_pass http://127.0.0.1:33445;
    }
}
```
**NOTE**: Running the bot with a process manager (like [PM2](https://discordjs.guide/improving-dev-environment/pm2.html)) is recommended.

>This bot must be run on a Discord bot account. Do NOT try to run this on a normal user account. This is against the Discord Terms of Service.

>Also, do NOT play with the `eval` command. You have been warned.


## Changes to the Code
You may change code if needed under the following conditions:

For the dashboard, you may change the theme, wording, design, links, etc. however I will not accept any bug reports coming from this. You will also agree to **not remove the copyright notice in the footer. You may add your name here, however, you must keep the original wording used.**

ALL copyright notices and credits must be kept as is, not edited in any way (except for adding your own name) and not removed.

## Contributing
Want to contribute?

Spiderjockey02's Discord Bot is written in [Discord.js](https://github.com/discordjs/discord.js). If you want to add a feature or work on the code, feel free make a pull request and your code might be accepted. But please try and keep a similary code format.

## Credits
* Bot based on AnIdiotsGuide's [example bot](https://github.com/AnIdiotsGuide/guidebot).
* Made using [Discord.js](https://github.com/discordjs/discord.js).
* Music plugin: [Discord Bot](https://github.com/eritislami/evobot)
* Logging System: [Code](https://github.com/CodeBullet-Community/BulletBot/blob/master/src/megalogger.ts)

## Privacy:
Please read the `PRIVACY.md` file.

## License:
Please read the `LICENSE` file
