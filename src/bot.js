// Dependencies
const Discord = require('discord.js');
const bot = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'], fetchAllMembers: true, ws: { intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_BANS', 'GUILD_EMOJIS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES', 'GUILD_PRESENCES', 'GUILD_VOICE_STATES'] } });
const { promisify } = require('util');
const readdir = promisify(require('fs').readdir);

// For translating messages
require('./handlers/extenders')(bot);

// giveaway manager
const GiveawaysManager = require('./base/giveaway/Manager');

const manager = new GiveawaysManager(bot, {
	storage: './src/assets/json/giveaways.json',
	updateCountdownEvery: 10000,
	default: {
		botsCanWin: false,
		exemptPermissions: [],
		embedColor: '#FF0000',
		reaction: '🎉',
	},
});
bot.giveawaysManager = manager;


// Logger (console log + file log)
bot.logger = require('./modules/logging/logger');
// For command handler
bot.aliases = new Discord.Collection();
bot.commands = new Discord.Collection();
bot.Stats = {
	MessageSent: 0,
	Giveaways: 0,
	WarnedUsers: 0,
	KickedUsers: 0,
	BannedUsers: 0,
	CommandsUsed: 0,
};

// Load commands
(async () => {
	// load commands
	const cmdFolders = await readdir('./src/commands/');
	bot.logger.log('=-=-=-=-=-=-=- Loading command(s): 101 -=-=-=-=-=-=-=');
	for (let i = 0; i < cmdFolders.length; i++) {
		const cmdFiles = await readdir(`./src/commands/${cmdFolders[i]}`);
		cmdFiles.forEach(file => {
			try {
				const cmds = require(`./commands/${cmdFolders[i]}/${file}`);
				bot.logger.log(`Loading command: ${file}`);
				bot.commands.set(cmds.config.command, cmds);
				if (cmds.config.aliases) {
					cmds.config.aliases.forEach(alias => {
						bot.aliases.set(alias, cmds.config.command);
					});
				}
			} catch (e) {
				console.log(e);
			}
		});
	}
	// load events
	const evtFiles = await readdir('./src/events/');
	bot.logger.log(`=-=-=-=-=-=-=- Loading events(s): ${evtFiles.length} -=-=-=-=-=-=-=`);
	evtFiles.forEach(file => {
		const eventName = file.split('.')[0];
		bot.logger.log(`Loading Event: ${eventName}`);
		const event = require(`./events/${file}`);
		bot.on(eventName, event.bind(null, bot));
	});

	// connect to database and get global functions
	bot.mongoose = require('./modules/database/mongoose');
	require('./utils/global-functions.js')(bot);

	// Load config for bot
	try {
		bot.config = require('./config.js');
	} catch (err) {
		console.error('Unable to load config.js \n', err);
		process.exit(1);
	}
	// music
	try {
		require('./base/Audio-Player')(bot);
	} catch (e) {
		bot.logger.error(e);
	}

	// Interact with console
	const y = process.openStdin();
	y.addListener('data', res => {
		const message = res.toString().trim();
		const args = res.toString().trim().split(/ +/g);
		// now run command
		if (args.length == 0) return;
		require('./handlers/console.js').run(args, message, bot);
	});

	// Connect bot to database
	bot.mongoose.init(bot);

	// Connect bot to discord API
	const token = bot.config.token;
	bot.login(token).catch(e => bot.logger.error(e.message));
})();
