// Dependencies
const Client = require('./base/Egglord.js');
require('./structures');
const bot = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'], fetchAllMembers: true, ws: { intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_BANS', 'GUILD_EMOJIS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES', 'GUILD_PRESENCES', 'GUILD_VOICE_STATES'] } });
const { promisify } = require('util');
const readdir = promisify(require('fs').readdir);

// Load commands
(async () => {
	// load commands
	const cmdFolders = await readdir('./src/commands/');
	bot.logger.log('=-=-=-=-=-=-=- Loading command(s): 125 -=-=-=-=-=-=-=');
	cmdFolders.forEach(async (dir) => {
		const commands = await readdir('./src/commands/' + dir + '/');
		commands.forEach((cmd) => {
			const resp = bot.loadCommand('./commands/' + dir, cmd);
			if (resp) bot.logger.error(resp);
		});
	});

	// load events
	const evtFiles = await readdir('./src/events/');
	bot.logger.log(`=-=-=-=-=-=-=- Loading events(s): ${evtFiles.length} -=-=-=-=-=-=-=`);
	evtFiles.forEach(file => {
		const eventName = file.split('.')[0];
		bot.logger.log(`Loading Event: ${eventName}`);
		const event = require(`./events/${file}`);
		bot.on(eventName, event.bind(null, bot));
	});

	// music
	try {
		require('./base/Audio-Player')(bot);
	} catch (e) {
		bot.logger.error(e);
	}

	// Connect bot to database
	bot.mongoose.init(bot);

	// Connect bot to discord API
	const token = bot.config.token;
	bot.login(token).catch(e => bot.logger.error(e.message));
})();
