// Dependencies
const Client = require('./base/Egglord.js');
require('./structures');

const bot = new Client(),
	{ promisify } = require('util'),
	readdir = promisify(require('fs').readdir),
	path = require('path');

// Load commands
(async () => {
	// load commands
	await loadCommands();

	// load events
	await loadEvents();

	// load translations
	bot.translations = await require('./helpers/LanguageManager')();

	// Connect bot to database
	bot.mongoose.init(bot);

	// load up adult site block list
	bot.fetchAdultSiteList();

	// Connect bot to discord API
	const token = bot.config.token;
	bot.login(token).catch(e => bot.logger.error(e.message));
})();

// load commands
async function loadCommands() {
	const cmdFolders = (await readdir('./src/commands/')).filter((v, i, a) => a.indexOf(v) === i);
	bot.logger.log('=-=-=-=-=-=-=- Loading command(s): 137 -=-=-=-=-=-=-=');
	// loop through each category
	cmdFolders.forEach(async (dir) => {
		if (bot.config.disabledPlugins.includes(dir) || dir == 'command.example.js') return;
		const commands = (await readdir('./src/commands/' + dir + '/')).filter((v, i, a) => a.indexOf(v) === i);
		// loop through each command in the category
		commands.forEach((cmd) => {
			if (bot.config.disabledCommands.includes(cmd.replace('.js', ''))) return;
			try {
				bot.loadCommand('./commands/' + dir, cmd);
			} catch (err) {
				if (bot.config.debug) console.log(err);
				bot.logger.error(`Unable to load command ${cmd}: ${err}`);
			}
		});
	});
}

// load events
async function loadEvents() {
	const evtFolder = await readdir('./src/events/');
	bot.logger.log('=-=-=-=-=-=-=- Loading events(s): 44 -=-=-=-=-=-=-=');
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
				} else if (folder == 'audio') {
					bot.manager.on(name, (...args) => event.run(bot, ...args));
				} else {
					bot.on(name, (...args) => event.run(bot, ...args));
				}
			} catch (err) {
				bot.logger.error(`Failed to load Event: ${name} error: ${err.message}`);
			}
		});
	});
}

// handle unhandledRejection errors
process.on('unhandledRejection', err => {
	bot.logger.error(`Unhandled promise rejection: ${err.message}.`);

	// show full error if debug mode is on
	console.log(err);
});
