//Makesure Node.js V12 or hight is being ran.
if (process.version.slice(1).split('.')[0] < 12) throw new Error('Node 12.0.0 or higher is required.');
//Dependencies
const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');
const path = require("path");
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);

//Logger (console log + file log)
bot.logger = require("./modules/logger");
//For command handler
bot.aliases = new Discord.Collection();
bot.commands = new Discord.Collection();

//Get Bot commands
const Cmodules = [`Fun`, `Guild`, 'Host', 'Levels', 'Music', `Search`, `Trivia`]
//Load commands
Cmodules.forEach(c => {
	fs.readdir(`./commands/${c}`, (err, files) => {
		if (err) console.log(err)
		files.forEach(f => {
			const cmds = require(`./commands/${c}/${f}`);
			bot.logger.log(`Loading command: ${f}`)
			bot.commands.set(cmds.config.command, cmds);
			cmds.config.aliases.forEach(alias => {
				bot.aliases.set(alias, cmds.config.command)
			})
		})
	})
})

//connect to database and get global functions
bot.mongoose = require('./modules/mongoose')
require('./modules/function.js')(bot)

//Load config for Egglord
try {
	bot.config = require('./config.js');
} catch (err) {
	console.error('Unable to load config.js \n', err);
	process.exit(1);
}

//Console chatter (add - allow commands to run from console)
let y = process.openStdin()
y.addListener("data", res => {
	let x = res.toString().trim().split(/ +/g)
	//now run command
	bot.channels.cache.find(channel => channel.id == x[0]).send(x.splice(1))
})

//Load events (what the bot does)
const init = async () => {
	await require("./modules/eventHandler")(bot)
	//Get web dashboard if enabled
	if (bot.config.Dashboard.enabled == true) {
		require("./modules/dashboard")(bot)
	}
	//Connect bot to database
	bot.mongoose.init(bot)
	//Connect bot to discord API
	var token = bot.config.token;
	bot.login(token).catch(e => bot.logger.log(e.message,"error"))
}

//Bot logins in
init();
