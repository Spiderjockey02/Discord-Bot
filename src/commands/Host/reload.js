// Dependencies
const	Command = require('../../structures/Command.js');

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
	async run(bot, message, args, settings) {
		// delete message
		if (message.deletable) message.delete();

		// Checks to see if a command was specified
		if (!args[0]) return message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));

		// checks to make sure command exists
		const commandName = args[0].toLowerCase();
		if (bot.commands.has(commandName) || bot.commands.get(bot.aliases.get(commandName))) {
			// Finds command
			const cmd = bot.commands.get(commandName) || bot.commands.get(bot.aliases.get(commandName));

			// reloads command
			try {
				await bot.unloadCommand(cmd.conf.location, cmd.help.name);
				await bot.loadCommand(cmd.conf.location, cmd.help.name);
				return message.success(settings.Language, 'HOST/RELOAD_SUCCESS', commandName).then(m => m.delete({ timeout: 8000 }));
			} catch(err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
			}
		} else if (Object.keys(bot._events).includes(args[0])) {
			try {
				delete require.cache[require.resolve(`../../events/${args[0]}`)];
				bot.removeAllListeners(args[0]);
				const event = require(`../../events/${args[0]}`);
				bot.logger.log(`Loading Event: ${args[0]}`);
				bot.on(args[0], event.bind(null, bot));
				return message.success(settings.Language, 'HOST/RELOAD_SUCCESS_EVENT', args[0]).then(m => m.delete({ timeout: 8000 }));
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
			}
		} else {
			return message.error(settings.Language, 'HOST/RELOAD_NO_COMMAND', commandName).then(m => m.delete({ timeout: 10000 }));
		}
	}
};
