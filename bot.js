// Make sure Node.js V12 or higher is being ran.
if (process.version.slice(1).split('.')[0] < 12) throw new Error('Node 12.0.0 or higher is required.');
// Dependencies
const Discord = require('discord.js');
const bot = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const fs = require('fs');

// Logger (console log + file log)
bot.logger = require('./modules/logging/logger');
// For command handler
bot.aliases = new Discord.Collection();
bot.commands = new Discord.Collection();
bot.messagesSent = 0;
// Load commands
(async () => {
	fs.readdir('./commands', function(err, folders) {
		bot.logger.log('=-=-=-=-=-=-=- Loading command(s): 63 -=-=-=-=-=-=-=');
		folders.forEach(file => {
			fs.readdir(`./commands/${file}`, (err, files) => {
				if (err) console.log(err);
				files.forEach(f => {
					const cmds = require(`./commands/${file}/${f}`);
					bot.logger.log(`Loading command: ${f}`);
					bot.commands.set(cmds.config.command, cmds);
					if (cmds.config.aliases) {
						cmds.config.aliases.forEach(alias => {
							bot.aliases.set(alias, cmds.config.command);
						});
					}
				});
			});
		});
	});
})();

// connect to database and get global functions
bot.mongoose = require('./modules/database/mongoose');
require('./utils/guild-settings.js')(bot);

// Load config for Egglord
try {
	bot.config = require('./config.js');
} catch (err) {
	console.error('Unable to load config.js \n', err);
	process.exit(1);
}

// Interact with console
const y = process.openStdin();
y.addListener('data', res => {
	const message = res.toString().trim();
	const args = res.toString().trim().split(/ +/g);
	// now run command
	if (args.length == 0) return;
	require('./utils/console.js').run(args, message, bot);
});

// Load events (what the bot does)
(async () => {
	await require('./utils/eventHandler')(bot);
	// Get web dashboard if enabled
	if (bot.config.Dashboard.enabled == true) {
		require('./modules/website/dashboard')(bot);
	}
	// Connect bot to database
	bot.mongoose.init(bot);
	// Connect bot to discord API
	const token = bot.config.token;
	bot.login(token).catch(e => bot.logger.error(e.message));
})();
