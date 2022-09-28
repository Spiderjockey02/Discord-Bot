// Dependencies
const { promisify } = require('util'),
	readdir = promisify(require('fs').readdir),
	path = require('path'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Reload command
 * @extends {Command}
*/
class Reload extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'reload',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Reloads a command.',
			usage: 'reload <command / event>',
			cooldown: 3000,
			examples: ['reload help', 'reload channelCreate'],
			slash: true,
			options: [{
				name: 'name',
				description: 'command or event to reload',
				type: ApplicationCommandOptionType.String,
				// choices: [...[...bot.commands.keys()].map(i => ({ name: i, value: i })), ...Object.keys(bot._events).map(i => ({ name: i, value: i }))],
				required: true,
			}],
		});
	}

	/**
	 * Function for receiving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(bot, message, settings) {
		// delete message
		if (message.deletable) message.delete();

		// Checks to see if a command was specified
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('host/reload:USAGE')) });

		// checks to make sure command exists
		const commandName = message.args[0].toLowerCase();
		if (bot.commands.has(commandName) || bot.commands.get(bot.aliases.get(commandName))) {
			// Finds command
			const cmd = bot.commands.get(commandName) || bot.commands.get(bot.aliases.get(commandName));

			// reloads command
			try {
				await bot.unloadCommand(cmd.conf.location, cmd.help.name);
				await bot.loadCommand(cmd.conf.location, cmd.help.name);
				return message.channel.success('host/reload:SUCCESS', { NAME: commandName }).then(m => m.timedDelete({ timeout: 8000 }));
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				if (message.deletable) message.delete();
				return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
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
							return message.channel.success('host/reload:SUCCESS_EVENT', { NAME: message.args[0] }).then(m => m.timedDelete({ timeout: 8000 }));
						}
					});
				});
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
			}
		} else {
			return message.channel.error('host/reload:INCORRECT_DETAILS', { NAME: commandName });
		}
	}

	/**
	 * Function for receiving interaction.
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @readonly
	*/
	async callback(bot, interaction) {
		interaction.reply({ content: 'This is currently unavailable.' });
	}
}

module.exports = Reload;
