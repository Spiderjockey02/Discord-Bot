<h1 align="center">
  <br>
  <img src="https://avatars.githubusercontent.com/u/97468814?s=200&v=4" alt=egglord />
  <br>
  Egglord
  <br>
</h1>

<h3 align=center>A fully customizable bot built with <a href=https://github.com/discordjs/discord.js>discord.js</a></h3>


<div align=center>

 [![Discord](https://img.shields.io/discord/658113349384667198.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/8g6zUQu)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=Spiderjockey02_Discord-Bot&metric=ncloc)](https://sonarcloud.io/dashboard?id=Spiderjockey02_Discord-Bot)
[![CodeFactor](https://www.codefactor.io/repository/github/spiderjockey02/discord-bot/badge/master)](https://www.codefactor.io/repository/github/spiderjockey02/discord-bot/overview/master)
![Website](https://img.shields.io/website?down_color=red&down_message=offline&up_color=green&up_message=online&url=https%3A%2F%2Fapi.egglord.dev%2F)
[![Crowdin](https://badges.crowdin.net/egglord-discord-bot/localized.svg)](https://crowdin.com/project/egglord-discord-bot)

</div>

<p align="center">
  <a href="https://github.com/Spiderjockey02/Discord-Bot/blob/master/README.md#question-about">About</a>
  •
  <a href="https://github.com/Spiderjockey02/Discord-Bot/blob/master/README.md#exclamation-features">Features</a>
  •
  <a href="https://github.com/Spiderjockey02/Discord-Bot/blob/master/README.md#memo-to-do">To-Do</a>
  •
  <a href="https://github.com/Spiderjockey02/Discord-Bot/blob/master/README.md#desktop_computer-my-other-projects">Installation</a>
  •
  <a href="https://github.com/Spiderjockey02/Discord-Bot/blob/master/README.md#book-license">License</a>
  •
  <a href="https://github.com/Spiderjockey02/Discord-Bot/blob/master/README.md#scroll-credits">Credits</a>
</p>
<p align="center">
  <a href="https://github.com/Spiderjockey02/Discord-Bot/blob/master/docs/LANGUAGES.md">Languages</a>
  •
  <a href="https://github.com/Spiderjockey02/Discord-Bot/blob/master/docs/PRIVACY.md">Privacy Policy</a>
  •
  <a href="https://github.com/Spiderjockey02/Discord-Bot/blob/master/docs/INSTALLATION.md">Installation</a>
  •
  <a href="https://github.com/Spiderjockey02/Discord-Bot/blob/master/docs/FAQ.md">FAQ</a>
  •
  <a href="https://github.com/Spiderjockey02/Discord-Bot/blob/master/docs/CONTRIBUTING.md">Contributing</a>
  •
  <a href="https://github.com/Spiderjockey02/Discord-Bot/blob/master/docs/CODE_OF_CONDUCT.md">Code of Conduct</a>
</p>

# Command list
><> = required, [] = optional

## Fun
|	Command	| description	| Usage
|---------------|--------------------|--------------|
| advice	|	Get some random advice	|	`advice`	|
| fact	|	Receive a random fact.	|	`fact`	|
| flip	|	Flip a coin.	|	`flip`	|
| meme	|	Sends a random meme.	|	`meme`	|
| pokemon	|	Get information on a pokemon.	|	`pokemon <pokemon>`	|
| random	|	Replies with a random number.	|	`random <LowNum> <HighNum>`	|
| reminder	|	Set a reminder.	|	`reminder <time> <information>`	|
| screenshot	|	Get a screenshot of a website.	|	`screenshot <url>`	|
| urban	|	Get the urban dictionary of a word.	|	`urban <word>`	|


## Host
|	Command	| description	| Usage
|---------------|--------------------|--------------|
| docs	|	Displays Discord.js documentation.	|	`docs <query>`	|
| eval	|	Evaluates JS code.	|	`eval <code>`	|
| lavalink	|	Displays Lavalink node information	|	`lavalink [host / list]`	|
| node	|	Add/remove a Node for lavalink.	|	`node <add / remove> [host] [password] [port]`	|
| reload	|	Reloads a command.	|	`reload <command / event>`	|
| script	|	Runs a script file.	|	`script <file name> [...params]`	|
| shutdown	|	Shutdowns the bot.	|	`shutdown`	|
| suggestion	|	Add a suggestion to bot	|	`suggestion <title> - <description> - <plugin>`	|
| test	|	Sends information about all the commands that I can do.	|	`help [command]`	|
| user	|	Edit a user's data	|	`user <id> [premium / banned / rank / reset] [true / false]`	|


## Guild
|	Command	| description	| Usage
|---------------|--------------------|--------------|
| avatar	|	Displays user's avatar.	|	`avatar [user]`	|
| dashboard	|	Sends a link to your Server's dashboard.	|	`dashboard`	|
| discrim	|	Discrim	|	`discrim [discriminator]`	|
| emoji-list	|	Displays the server's emojis	|	`emojilist`	|
| firstmessage	|	Gets the first message from the channel.	|	`firstmessage [channel]`	|
| guildicon	|	Get the server's icon.	|	`guildicon`	|
| poll	|	Create a poll for users to answer.	|	`poll <question>`	|
| role-info	|	Get information on a role.	|	`role-info <role>`	|
| server-info	|	Get information on the server.	|	`server-info`	|
| user-info	|	Get information on a user.	|	`user-info [user]`	|


## Giveaway
|	Command	| description	| Usage
|---------------|--------------------|--------------|
| g-delete	|	Delete a giveaway	|	`g-delete <messageID>`	|
| g-edit	|	Edit a giveaway.	|	`g-edit <messageID> <AddedTime> <newWinnerCount> <NewPrize>`	|
| g-reroll	|	reroll a giveaway.	|	`g-reroll <messageID> [winners]`	|
| g-start	|	Start a giveaway	|	`g-start <time> <Number of winners> <prize>`	|


## Image
|	Command	| description	| Usage
|---------------|--------------------|--------------|
| blurpify	|	Blurpify an image.	|	`blurpify [file]`	|
| captcha	|	Create a captcha image.	|	`captcha`	|
| cat	|	Have a nice picture of a cat.	|	`cat`	|
| changemymind	|	Create a change my mind image.	|	`changemymind <text>`	|
| clyde	|	Create a fake Clyde message.	|	`clyde <text>`	|
| deepfry	|	Deepfry an image.	|	`deepfry [file]`	|
| dog	|	Have a nice picture of a dog.	|	`dog`	|
| generate	|	Generate a custom image.	|	`generate <option> [image]`	|
| image	|	Finds an image based on the topic.	|	`image <topic>`	|
| phcomment	|	Create a fake Pornhub comment.	|	`phcomment [user] <text>`	|
| qrcode	|	Create a QR code.	|	`qrcode <text / file>`	|
| ship	|	Create a ship image.	|	`ship <user1> [user2]`	|
| stickbug	|	Create a stickbug meme.	|	`stickbug [file]`	|
| threats	|	Creates a threat meme.	|	`threats [image]`	|
| twitter	|	Create a fake Twitter tweet.	|	`twitter [user] <text>`	|
| whowouldwin	|	Create a whowouldwin image.	|	`whowouldwin <user1> [user2]`	|


## Level
|	Command	| description	| Usage
|---------------|--------------------|--------------|
| leaderboard	|	Displays the Servers's level leaderboard.	|	`leaderboard`	|
| rank	|	Shows your rank/Level.	|	`level [username]`	|


## Moderation
|	Command	| description	| Usage
|---------------|--------------------|--------------|
| addrole	|	Adds a new role to the server	|	`addrole <role name> [hex color] [hoist]`	|
| ban	|	Ban a user.	|	`ban <user> [reason] [time]`	|
| clear-warning	|	Remove warnings from a user.	|	`clear-warning <user> [warning number]`	|
| clear	|	Clear a certain amount of messages.	|	`clear <Number> [member]`	|
| deafen	|	Deafen a user.	|	`deafen <user>`	|
| delrole	|	Delete a role from the server.	|	`delrole <role>`	|
| dm	|	DM a user	|	`dm <user> <message>`	|
| editrole	|	Edit a role's data in the server	|	`editrole <role name> <option> <value>`	|
| kick	|	Kick a user.	|	`kick <user> [reason]`	|
| mute	|	Mute a user.	|	`mute <user> [time]`	|
| nick	|	Change the nickname of a user.	|	`nick <user> <name>`	|
| report	|	Report a user.	|	`report <user> [reason]`	|
| slowmode	|	Activate slowmode on a channel.	|	`slowmode <time / off>`	|
| unban	|	Unban a user.	|	`unban <userID> [reason]`	|
| undeafen	|	Undeafen a user.	|	`undeafen <user>`	|
| unmute	|	Unmute a user.	|	`unmute <user>`	|
| warn	|	Warn a user.	|	`warn <user> [time] [reason]`	|
| warnings	|	Display number of warnings a user has.	|	`warnings [user]`	|


## Misc
|	Command	| description	| Usage
|---------------|--------------------|--------------|
| about	|	Information about me.	|	`about`	|
| help	|	Sends information about all the commands that I can do.	|	`help [command]`	|
| invite	|	Send an invite link so people can add me to their server.	|	`invite`	|
| privacy	|	Sends a link to the privacy policy.	|	`privacy`	|
| shorturl	|	Creates a shorturl on the URL you sent.	|	`shorturl`	|
| status	|	Gets the status of the bot.	|	`status`	|
| support	|	Get support on the bot.	|	`support`	|
| uptime	|	Gets the uptime of the bot.	|	`uptime`	|


## Music
|	Command	| description	| Usage
|---------------|--------------------|--------------|
| 247	|	Stays in the voice channel even if no one is in it.	|	`24/7`	|
| back	|	Plays the previous song in the queue.	|	`back`	|
| bassboost	|	Bassboost the song	|	`bassboost [value]`	|
| dc	|	Disconnects the bot from the voice channel.	|	`dc`	|
| fast-forward	|	Fast forwards the player by your specified amount.	|	`fast-forward <time>`	|
| join	|	Makes the bot join your voice channel.	|	`join`	|
| loop	|	Loops the song or queue.	|	`loop [queue / song]`	|
| lyrics	|	Get lyrics on a song.	|	`lyrics [song]`	|
| move	|	Moves the specified song to the specified position.	|	`move <position> <new position>`	|
| nightcore	|	Toggles nightcore mode.	|	`nightcore`	|
| np	|	Shows the current song playing.	|	`np`	|
| p-add	|	Add a song to the playlist	|	`p-add <playlist name> <song>`	|
| p-create	|	Create a playlist	|	`p-create <playlist name> <search query/link>`	|
| p-delete	|	Delete a playlist	|	`p-delete <playlist name>`	|
| p-load	|	Load a playlist	|	`p-load <playlist name>`	|
| p-remove	|	remove a song from the playlist	|	`p-remove <playlist name> <position> [position]`	|
| p-view	|	View a playlist	|	`p-view <playlist name>`	|
| pause	|	Pauses the music.	|	`pause`	|
| pitch	|	Sets the player's pitch. If you input "reset", it will set the pitch back to default.	|	`pitch`	|
| play	|	Play a song.	|	`play <link / song name>`	|
| previous	|	Displays the previous tracks that have been played.	|	`previous [pageNumber]`	|
| queue	|	Displays the queue.	|	`queue [pageNumber]`	|
| radio	|	Listen to the radio	|	`radio <query>`	|
| remove	|	Removes a song from the queue	|	`remove <position> [position]`	|
| resume	|	Resumes the music.	|	`resume`	|
| rewind	|	Rewinds the player by your specified amount.	|	`rewind <time>`	|
| search	|	Searches for a song.	|	`search <link / song name>`	|
| seek	|	Sets the playing track's position to the specified position.	|	`seek <time>`	|
| shuffle	|	Shuffles the playlist.	|	`shuffle`	|
| skip	|	Skips the current song.	|	`skip`	|
| speed	|	Sets the player's playback speed.	|	`speed <Number>`	|
| vaporwave	|	Toggles vaporwave mode.	|	`vaporwave`	|
| volume	|	Changes the volume of the song	|	`volume <Number>`	|


## NSFW
|	Command	| description	| Usage
|---------------|--------------------|--------------|
| 4k	|	Look at NSFW images.	|	`4k`	|
| anal	|	Look at NSFW images.	|	`anal`	|
| ass	|	Look at NSFW images.	|	`ass`	|
| boobs	|	Look at NSFW images.	|	`boobs`	|
| gonewild	|	Look at NSFW images.	|	`gonewild`	|
| hneko	|	Look at NSFW images.	|	`hneko`	|
| pgif	|	Look at NSFW images.	|	`pgif`	|
| pussy	|	Look at NSFW images.	|	`pussy`	|
| thigh	|	Look at NSFW images.	|	`thigh`	|


## Plugins
|	Command	| description	| Usage
|---------------|--------------------|--------------|
| rr-add	|	Create a reaction role	|	`rr-add [channelID / message link]`	|
| rr-remove	|	Make reaction roles	|	`reactionroles <messagelink>`	|
| set-lang	|	Choose the language for the bot.	|	`setlang <language>`	|
| set-logs	|	Update the log plugin.	|	`set-logs <option> [data]`	|
| set-plugin	|	Toggle plugins on and off	|	`set-plugin <option>`	|


## Searcher
|	Command	| description	| Usage
|---------------|--------------------|--------------|
| fortnite	|	Get information on a Fortnite account.	|	`fortnite <kbm / gamepad / touch> <user>`	|
| instagram	|	Get information on an Instagram account.	|	`instagram <user>`	|
| mc	|	Pings a minecraft for information.	|	`mc <IP> [Port]`	|
| r6	|	Gets statistics on a Rainbow 6 Account.	|	`r6 <user> [pc / xbox / ps4] [eu / na / as]`	|
| reddit	|	Send a random image from a chosen subreddit.	|	`reddit <subreddit>`	|
| steam	|	Get information on a Steam account.	|	`steam <user>`	|
| twitch	|	Get information on a twitch account.	|	`twitch <user>`	|
| weather	|	Look up the weather in a certain area.	|	`weather <location>`	|


## Tags
|	Command	| description	| Usage
|---------------|--------------------|--------------|
| tag-add	|	Add a new tag to the server	|	`tag-add <name> <response>`	|
| tag-delete	|	Remove a tag from the server	|	`tag-delete <name>`	|
| tag-edit	|	Edit a tag from this server	|	`tag-edit <rename / edit> <name> <newName / newResponse>`	|
| tag-view	|	View the server's tag(s)	|	`tag-view [name]`	|
| tags	|	Edit server's tags	|	`tag <add/del/edit/view> <required paramters>`	|


## Ticket
|	Command	| description	| Usage
|---------------|--------------------|--------------|
| ticket-close	|	Closes the current ticket channel	|	`ticket-close`	|
| ticket-create	|	Creates a ticket	|	`ticket-create [reason]`	|
| ticket-setup	|	Setups the ticket plugin	|	`ticket-setup`	|
| ticket	|	Information on ticket plugin.	|	`ticket`	|

