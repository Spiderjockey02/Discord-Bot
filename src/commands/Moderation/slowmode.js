// Dependencies
const { time: { getTotalTime, getReadableTime } } = require('../../utils'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Slowmode command
 * @extends {Command}
*/
class Slowmode extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'slowmode',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['slow-mode'],
			userPermissions: [Flags.ManageChannels],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ManageChannels],
			description: 'Activate slowmode on a channel.',
			usage: 'slowmode <time / off>',
			cooldown: 5000,
			examples: ['slowmode off', 'slowmode 1m'],
			slash: true,
			options: [
				{
					name: 'input',
					description: 'How long for slowmode',
					type: ApplicationCommandOptionType.String,
					required: true,
				},
			],
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
		// Delete message
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// get time
		let time;
		if (message.args[0] == 'off') {
			time = 0;
		} else if (message.args[0]) {
			const { error, success } = getTotalTime(message.args[0]);
			if (error) return message.channel.error(error);
			time = success;
		} else {
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/slowmode:USAGE')) });
		}

		// Activate slowmode
		try {
			await message.channel.setRateLimitPerUser(time / 1000);
			message.channel.success('moderation/slowmode:SUCCESS', { TIME: time == 0 ? message.translate('misc:OFF') : getReadableTime(time) });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
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
		const input = args.get('input'),
			channel = guild.channels.cache.get(interaction.channelId);

		// get time
		let time;
		if (input == 'off') {
			time = 0;
		} else if (input) {
			const { error, success } = getTotalTime(args.get('input').value);
			if (error) return interaction.reply({ embeds: [channel.error(error, null, true)] });
			time = success;
		}

		// Activate slowmode
		try {
			await channel.setRateLimitPerUser(time / 1000);
			interaction.reply({ embeds: [channel.error('moderation/slowmode:SUCCESS', { TIME: time == 0 ? guild.translate('misc:OFF') : getReadableTime(time) }, true)] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}
}

module.exports = Slowmode;
