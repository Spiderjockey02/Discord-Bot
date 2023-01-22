// Dependencies
const { ApplicationCommandOptionType } = require('discord.js'),
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
			name: 'reload-commands',
			ownerOnly: true,
			dirname: __dirname,
			description: 'Reloads a command.',
			usage: 'reload command',
			cooldown: 3000,
			examples: ['reload help'],
			slash: false,
			isSubCmd: true,
			options: [{
				name: 'command',
				description: 'Command to reload',
				type: ApplicationCommandOptionType.String,
				required: true,
				autocomplete: true,
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
				cmd.unload();
				cmd.load(bot);
				return message.channel.success('host/reload:SUCCESS', { NAME: commandName }).then(m => m.timedDelete({ timeout: 8000 }));
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
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const cmdName = args.get('command').value,
			channel = guild.channels.cache.get(interaction.channelId);

		if (bot.commands.has(cmdName) || bot.commands.get(bot.aliases.get(cmdName))) {
			// Finds command
			const cmd = bot.commands.get(cmdName) || bot.commands.get(bot.aliases.get(cmdName));

			// reloads command
			try {
				cmd.unload();
				cmd.load(bot);
				interaction.reply({ embeds: [channel.success('host/reload:SUCCESS', { NAME: cmdName }, true)], fetchReply: true }).then(m => m.timedDelete({ timeout: 8000 }));
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
			}
		} else {
			interaction.reply({ embeds: [channel.error(`${cmdName} is not a command name nor alias of a command.`, null, true)], ephemeral: true });
		}
	}

	/**
	 * Function for handling autocomplete
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @readonly
	*/
	async autocomplete(bot, interaction) {
		const events = bot.commands.map(i => i.help.name).sort(),
			input = interaction.options.getFocused(true).value;
		const selectedEvents = events.filter(i => i.toLowerCase().startsWith(input)).slice(0, 10);

		interaction.respond(selectedEvents.map(i => ({ name: i, value: i })));
	}
}

module.exports = Reload;
