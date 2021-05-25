// Dependencies
const Client = require('./base/Egglord.js');
require('./structures');
const bot = new Client({
	partials: ['GUILD_MEMBER', 'USER', 'MESSAGE', 'CHANNEL', 'REACTION'],
	ws: {
		intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_BANS', 'GUILD_EMOJIS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES', 'GUILD_VOICE_STATES', 'GUILD_INVITES'],
	},
});
const { promisify } = require('util');
const readdir = promisify(require('fs').readdir);
const path = require('path');

// Load commands
(async () => {
	// load commands
	const cmdFolders = (await readdir('./src/commands/')).filter((v, i, a) => a.indexOf(v) === i);
	bot.logger.log('=-=-=-=-=-=-=- Loading command(s): 125 -=-=-=-=-=-=-=');
	cmdFolders.forEach(async (dir) => {
		if (bot.config.disabledPlugins.includes(dir)) return;
		try {
			const commands = (await readdir('./src/commands/' + dir + '/')).filter((v, i, a) => a.indexOf(v) === i);
			commands.forEach((cmd) => {
				if (bot.config.disabledCommands.includes(cmd.replace('.js', ''))) return;
				const resp = bot.loadCommand('./commands/' + dir, cmd);
				if (resp) bot.logger.error(resp);
			});
		} catch (err) {
			console.log(err.message);
		}
	});

	// load events
	const evtFolder = await readdir('./src/events/');
	bot.logger.log(`=-=-=-=-=-=-=- Loading events(s): ${evtFolder.length} -=-=-=-=-=-=-=`);
	evtFolder.forEach(async folder => {
		const folders = await readdir('./src/events/' + folder + '/');
		folders.forEach(async file => {
			delete require.cache[file];
			const { name } = path.parse(file);
			try {
				const event = new (require(`./events/${folder}/${file}`))(bot, name);
				bot.logger.log(`Loading Event: ${name}`);
				if (folder == 'giveaway') {
					bot.giveawaysManager.on(name, (...args) => event.run(bot, ...args));
				} else {
					bot.on(name, (...args) => event.run(bot, ...args));
				}
			} catch (err) {
				bot.logger.error(`Failed to load Event: ${name} error: ${err.message}`);
			}
		});
	});

	bot.translations = await require('./helpers/LanguageManager')();

	// Audio player
	try {
		require('./base/Audio-Manager')(bot);
	} catch (e) {
		bot.logger.error(e);
	}

	// Connect bot to database
	bot.mongoose.init(bot);

	// load up adult site block list
	bot.fetchAdultSiteList();

	// Connect bot to discord API
	const token = bot.config.token;
	bot.login(token).catch(e => bot.logger.error(e.message));

	// handle unhandledRejection errors
	process.on('unhandledRejection', err => {
		bot.logger.error(`Unhandled promise rejection: ${err.message}.`);

		// show full error if debug mode is on
		if (bot.config.debug) console.log(err);
	});
})();
