# Discord bot
This is my first Discord bot made using [discord.js](https://github.com/discordjs/discord.js)

[![Discord](https://img.shields.io/discord/658113349384667198.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/8g6zUQu)
![GitHub repo size](https://img.shields.io/github/repo-size/Spiderjockey02/Discord-Bot)
![Website](https://img.shields.io/website?down_color=red&down_message=offline&up_color=green&up_message=online&url=http%3A%2F%2F86.25.177.233%2F)

## Features
* Music
  * Can play music from [Youtube](https://www.youtube.com/), [Spotify](https://www.spotify.com/) & [Soundcloud](https://www.soundcloud.com) (More to come)
  * Searches up lyrics from [KSOFT.API](https://api.ksoft.si/)
  * Shuffles your song queue.
* Host
  * Add a global ban on a user. (That user will not be able to join any servers with this bot in)
  * Shutdown the bot via a command.
  * Eval command for bug testing.
  * Bug command for users to write their own bug reports.
  * Reload commands.
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
More than 60 commands

## Upcoming features
* More event listeners.
* Improved bot dashboard (web server).
* Music trivia - Minigame to play with your friends.
* Radio
  * Listen to the radio while in a call. (Currently 7 radio-stations)
## Installation
First of all, clone this repository. (Download or run `git clone https://github.com/Spiderjockey02/discordbot.git`)

This bot requires [Node.js](https://nodejs.org/en/) v12+ (and npm) to run

Also, please make a channel for mod logs in your Discord server.

Once you have that done, edit the config.js file ane sure the callback URL specified is in the format of {{http|https}}{{domain_name}}/callback (Examples: https://dashoard.bot-website.com/callback OR http://dashboard.bot-website.com/callback OR http://localhost:33445/callback). This should be the public URL (proxied URL (by something like Nginx) is recommended).

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
