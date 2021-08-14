// Dependencies
const { time: { getTotalTime } } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * Slowmode command
 * @extends {Command}
*/
module.exports = class Slowmode extends Command {
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
			userPermissions: ['MANAGE_CHANNELS'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_CHANNELS'],
			description: 'Activate slowmode on a channel.',
			usage: 'slowmode <time / off>',
			cooldown: 5000,
			examples: ['slowmode off', 'slowmode 1m'],
			slash: true,
			options: [{
				name: 'time',
				description: 'The slowmode time.',
				type: 'STRING',
				required: true,
			}],
			defaultPermission: false,
		});
	}

	/**
 	 * Function for recieving message.
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
			time = getTotalTime(message.args[0], message);
			if (!time) return;
		} else {
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/slowmode:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
		}

		// Activate slowmode
		try {
			await message.channel.setRateLimitPerUser(time / 1000);
			message.channel.success('moderation/slowmode:SUCCESS', { TIME: time == 0 ? message.translate('misc:OFF') : time / 1000 }).then(m => m.timedDelete({ timeout:15000 }));
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}

	/**
 * Function for recieving interaction.
 * @param {bot} bot The instantiating client.
 * @param {interaction} interaction The interaction that ran the command.
 * @param {guild} guild The guild the interaction ran in.
 * @readonly
*/
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId);
		const apparentTime = args.get('time').value;
		let time;
		if (apparentTime == 'off') {
			time = 0;
		} else if (apparentTime) {
			time = getTotalTime(apparentTime, apparentTime);
			if (!time) return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: null }, true)] });
		}
		// Activate slowmode
		try {
			await channel.setRateLimitPerUser(time / 1000);
			return interaction.reply({ ephemeral: guild.settings.ModerationClearToggle, embeds: [channel.success('moderation/slowmode:SUCCESS', { TIME: time == 0 ? bot.translate('misc:OFF') : time / 1000 }, true)] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}
};
