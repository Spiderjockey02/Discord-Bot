<h1 align="center">
  <br>
  Self hosting the bot
  <br>
</h1>

Want to host the bot yourself, if not [invite him](https://discord.com/oauth2/authorize?response_type=code&client_id=647203942903840779&permissions=8&scope=bot)?

>Support will only be given on errors done by the base source code. (No edits to the code.)

### Setting up server
* The system you are using to host on must have a minimum version [Node.js](https://nodejs.org/en/) 14. (It will not run at all if less).
* If you are hosting the lavalink aswell on the same system, it will need [Java](https://adoptopenjdk.net/) v11+ (v13 is preferred) and if not on the same system you will need to get the IP and port of the server. (This may require editing of application.yml)
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
* For entering Lavalink server information (host, port, password): `src/base/Audio-Manager#14`. As nodes is an array you can multiply lavalink servers connected to the same bot, this helps with ratelimiting.

### Editing the files
* Want to create your own commands?
    * There is an example of an empty command you can use to make your own command in the commands folder. (`src/commands`). **Once you have created your command make sure to place it in one of the predefined categories.**
* Added a new category, but the commands are not working?
    * You will need to add the category name to the guild's setting's plugins array. (You will need to update all guilds with this new change)


### Running the bot + Lavalink
> Run the lavalink first as lavalink can take longer to load than the bot.
* For running the lavalink, use the command: `java -jar Lavalink.jar`
* For running the bot, go to the main directory (same directory as package.json) and run command:
```sh
node .    
```
