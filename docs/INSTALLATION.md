<h1 align="center">
  <br>
  Self hosting the bot
  <br>
</h1>

Want to host the bot yourself, if not [invite him](https://discord.com/oauth2/authorize?response_type=code&client_id=647203942903840779&permissions=8&scope=bot)?

>Support will only be given on errors done by the base source code. (No edits to the code.)

### Setting up server
* The system you are using to host on must have [Node.js](https://nodejs.org/en/) 18 or later.
* Music playback uses native Discord voice, yt-dlp and FFmpeg. A system FFmpeg (on `PATH`, or set with the `FFMPEG_PATH` environment variable) is used first, otherwise the bundled ffmpeg-static binary. yt-dlp needs Python 3. Java and a separate audio server are not required.
* (Optional) You can also host the [mongo](https://www.mongodb.com/) database on your system but this is optional.

### Setting up the database
The database natively used is [MongoDB](https://www.mongodb.com/). So you will need to [create an account](https://www.mongodb.com/try) for this step.

* Once you have created an account navigate to the cluster page and create a free cluster.
* Next wait for the changes to be deployed (this could take upto 5 minutes) and click the `connect` button.
* Select the `Allow Access from Anywhere` button and then `Add Ip Address`.
* Create a `dbUser` and `dbUserPassword` and hold onto this for later.
* Navigate to `Choose a connection method` click `Connect your application` and copy the provided link.
* Navigate to `src/config.js` in your bot and replace the `mongodb://link`at the bottom with the link you have copied. **Make sure to replace `<password>` with the password you created** .

### Configuring the config file
Find the file `src/config.example.js`, this is where all your information will go. The links to each API is above each line, commented out.
* The API's are **highly recommended** to fill in but are optionally (If you have a missing API, the command it  to will not work.)
* `disabledCommands` & `disabledPlugins` An array of commands or categories you don't want loaded on the bot.
* `SupportServer` will match the support server for your bot.
* `websiteURL` will match your bot's dashboard, If you don't have one use `https://localhost`.
* `defaultSettings` are the settings the bot will use when in **DM's**.
* `MongoDBURl` where your MongoDB URL will go. (This is VITAL, you need it for the bot to work)
* Make sure to add your bot to **the emoji [server](https://discord.gg/juFcfkVDGx)** to get access to the custom emoijis.
> Once the config is filled out rename **config.example.js** to **config.js**


### Editing bot settings
* For editing guild settings: `src/database/models/GuildSettings.js`.
* Music playback needs no audio server. yt-dlp and FFmpeg are installed with the bot (their install scripts must be allowed, see `pnpm-workspace.yaml`) and resolve audio locally.
* Optional music settings live under `Music` in `src/config.js`:
    * `youtube`: a PO token or cookies, if YouTube asks the bot to "sign in to confirm you're not a bot".
    * `spotify`: Spotify API credentials, for Spotify tracks, albums, playlists and artists (played from YouTube).
    * `songlink`: a self-hosted [SongLink API](https://github.com/thororen1234/SongLinkAPI), for exact matches of Spotify, Apple Music, Deezer and Tidal links.
    * `tidal`: a [TidalSubsonic](https://github.com/vMohammad24/TidalSubsonic) server, to play Tidal links and searches from Tidal.
    * `defaultSource`, `disabledProviders`, `maxPlaylistSize`, `uploads`, `floweryTts` and `speechTts`.
* Deezer and Apple Music links, SoundCloud, direct audio links, file uploads and the other sites yt-dlp supports work without any extra setup.

### Editing the files
* Want to create your own commands?
    * There is an example of an empty command you can use to make your own command in the commands folder. (`src/commands`). **Once you have created your command make sure to place it in one of the predefined categories.**
* Added a new category, but the commands are not working?
    * You will need to add the category name to the guild's setting's plugins array. (You will need to update all guilds with this new change)


### Running the bot
* Go to the main directory (same directory as package.json) and run:
```sh
node .    
```
