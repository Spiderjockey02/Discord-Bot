// Dependencies
const { time: { getTotalTime } } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * Mute command
 * @extends {Command}
*/
class Mute extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'mute',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['timeout'],
			userPermissions: ['MUTE_MEMBERS'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'MUTE_MEMBERS', 'MANAGE_ROLES'],
			description: 'Put a user in timeout.',
			usage: 'mute <user> [time]',
			cooldown: 2000,
			examples: ['mute username', 'mute username 5m'],
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

		// check if a user was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/mute:USAGE')) }).then(m => m.timedDelete({ timeout: 10000 }));

		// Get members mentioned in message
		const members = await message.getMember(false);

		// Make sure atleast a guildmember was found
		if (!members[0]) return message.channel.error('moderation/ban:MISSING_USER').then(m => m.timedDelete({ timeout: 10000 }));

		// Get the channel the member is in
		const channel = message.guild.channels.cache.get(members[0].voice.channelID);
		if (channel) {
			// Make sure bot can deafen members
			if (!channel.permissionsFor(bot.user).has('MUTE_MEMBERS')) {
				bot.logger.error(`Missing permission: \`MUTE_MEMBERS\` in [${message.guild.id}].`);
				return message.channel.error('misc:MISSING_PERMISSION', { PERMISSIONS: message.translate('permissions:MUTE_MEMBERS') }).then(m => m.timedDelete({ timeout: 10000 }));
			}
		}

		// Make sure user isn't trying to punish themselves
		if (members[0].user.id == message.author.id) return message.channel.error('misc:SELF_PUNISH').then(m => m.timedDelete({ timeout: 10000 }));

		// put user in timeout
		try {
			// default time is 7 days
			await members[0].timeout(getTotalTime(message.args[1], message) ?? 604800000, `${message.author.id} put user in timeout`);
			message.channel.success('moderation/mute:SUCCESS', { USER: members[0].user }).then(m => m.timedDelete({ timeout: 3000 }));
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}
}

module.exports = Mute;
