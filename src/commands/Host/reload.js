// Dependencies
const { promisify } = require('util'),
	readdir = promisify(require('fs').readdir),
	path = require('path'),
	Command = require('../../structures/Command.js');

module.exports = class Reload extends Command {
	constructor(bot) {
		super(bot, {
			name: 'reload',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Reloads a command.',
			usage: 'reload <command | event>',
			cooldown: 3000,
			examples: ['reload help', 'reload channelCreate'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// delete message
		if (message.deletable) message.delete();

		// Checks to see if a command was specified
		if (!message.args[0]) return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));

		// checks to make sure command exists
		const commandName = message.args[0].toLowerCase();
		if (bot.commands.has(commandName) || bot.commands.get(bot.aliases.get(commandName))) {
			// Finds command
			const cmd = bot.commands.get(commandName) || bot.commands.get(bot.aliases.get(commandName));

			// reloads command
			try {
				await bot.unloadCommand(cmd.conf.location, cmd.help.name);
				await bot.loadCommand(cmd.conf.location, cmd.help.name);
				return message.channel.success(settings.Language, 'HOST/RELOAD_SUCCESS', commandName).then(m => m.delete({ timeout: 8000 }));
			} catch(err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
			}
		} else if (Object.keys(bot._events).includes(message.args[0])) {
			try {
				// locate file
				let fileDirectory;
				const evtFolder = await readdir('./src/events/');
				evtFolder.forEach(async folder => {
					const folders = await readdir('./src/events/' + folder + '/');
					folders.forEach(async file => {
						const { name } = path.parse(file);
						if (name == message.args[0]) {
							fileDirectory = `../../events/${folder}/${file}`;
							delete require.cache[require.resolve(fileDirectory)];
							bot.removeAllListeners(message.args[0]);
							const event = new (require(fileDirectory))(bot, message.args[0]);
							bot.logger.log(`Loading Event: ${message.args[0]}`);
							// eslint-disable-next-line no-shadow
							bot.on(message.args[0], (...args) => event.run(bot, ...args));
							return message.channel.success(settings.Language, 'HOST/RELOAD_SUCCESS_EVENT', message.args[0]).then(m => m.delete({ timeout: 8000 }));
						}
					});
				});
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
			}
		} else {
			return message.channel.error(settings.Language, 'HOST/RELOAD_NO_COMMAND', commandName).then(m => m.delete({ timeout: 10000 }));
		}
	}
};
