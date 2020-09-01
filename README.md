# Discord bot
This is my first Discord bot made using [discord.js](https://github.com/discordjs/discord.js)

[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/Spiderjockey02/discordbot/graphs/commit-activity)
## Features
* Music
  * Can play music from [Youtube](https://www.youtube.com/) and [Spotify](https://www.spotify.com/) (more to come soon).
  * Searches up lyrics from [KSOFT.API](https://api.ksoft.si/)
  * Music trivia - Minigame to play with your friends.
  * Shuffles your song queue.
* Host
  * Add a global ban on a user. (That user will not be able to join any servers with this bot in)
  * Shutdown the bot via a command.
  * Eval command for bug testing.
  * Bug command for users to write their own bug reports.
  * Reload commands.
* Radio
  * Listen to the radio while in a call. (Currently 7 radio-stations)
* Moderation
  * Auto-Moderation (highly customisable)
  * Get info on role, user and server.
  * (Un)mute and (Un)deafen users.
  * Nick users.
  * Ban, kick and warn users.
  * Clear messages (even purge certain user messages)
* Rank system
  * Adds a fun ranking system for your users to see who is the most active. (Very customizable)
* Custom searches
  * Search for player stats; This includes Fortnite, Apex, Steam, Instagram, Rainbow 6 Siege and Twitch.
* Miscellaneous
  * Flip a coin
  * Get random facts (over 3000 random facts)
  * Search for a random image
  * Search for a meme
  * Play some minigames; includes Rock, paper, scissors and more
  * Get a random image from a sub-reddit.
* Event listening
  * Sends welcome and goodbye messages
  * Update member stats
  * Listens for role, user or server updates and displays in a log channel.
  * All of these `Event listener` are highly customisable.
A total of 63 commands.
## Upcoming features
* More event listeners.
* Improved bot dashboard (web server).
## Installation
First of all, clone this repository. (Download or run `git clone https://github.com/Spiderjockey02/discordbot.git`)

This bot requires [Node.js](https://nodejs.org/en/) v8+ (and npm) to run

Also, please make a channel for mod logs in your Discord server.

Once you have that done, edit the config.js file ane sure the callback URL specified is in the format of {{http|https}}{{domain_name}}/callback (Examples: https://dashoard.bot-website.com/callback OR http://dashboard.bot-website.com/callback OR http://localhost:33445/callback). This should be the public URL (proxied URL (by something like Nginx) is recommended).

![Image](https://camo.githubusercontent.com/1ccd4acf2f12a5d29a3e1e51c3e29e30485ede07/68747470733a2f2f692e696d6775722e636f6d2f736563684b76672e706e67)
It is recommended to run the dashboard with a proxy (like Nginx)
## Nginx Configuration
```
server {
    listen 80;

    server_name dashboard.bot-website.com;

    location / {
        proxy_pass http://127.0.0.1:33445;
    }
}
```
After that, you can install the dependencies (including [MongoDB](https://www.mongodb.com/)) and start the bot
### You can use the command line
```
$ cd DiscordBot
$ npm install
$ npm start
```
**OR** start the bot using the `linux_run.sh` for Linux or `windows_run.bat` for Windows. These files may be outdated.

**NOTE**: Running the bot with a process manager (like PM2) is recommended.

>This bot must be run on a Discord bot account. Do NOT try to run this on a normal user account. This is against the Discord Terms of Service.

>Also, do NOT play with the `eval` command. You have been warned.

## Changes to the Code
You may change code if needed under the following conditions:

For the dashboard, you may change the theme, wording, design, links, etc. however I will not accept any bug reports coming from this. You will also agree to **not remove the copyright notice in the footer. You may add your name here, however, you must keep the original wording used.**

ALL copyright notices and credits must be kept as is, not edited in any way (except for adding your own name) and not removed.

## Contributing
Want to contribute?

Spiderjockey02's Discord Bot is written in Discord.js. If you want to add a feature or work on the code, feel free make a pull request and your code might be accepted.

## Credits
* Bot based on AnIdiotsGuide's [example bot](https://github.com/AnIdiotsGuide/guidebot).
* Made using [Discord.js](https://github.com/discordjs/discord.js).
## Privacy:
Please read the `PRIVACY.md` file.

## License:
Please read the `LICENSE` file
