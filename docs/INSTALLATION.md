## Self hosting the bot
Want to host the bot yourself, if not [invite him](https://discord.com/oauth2/authorize?response_type=code&client_id=647203942903840779&permissions=8&scope=bot)?

>Support will only be given on errors done by the base source code. (No edits to the code.)
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
