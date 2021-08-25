// Dependencies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * Kick command
 * @extends {Command}
*/
class Kick extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'kick',
			guildOnly: true,
			dirname: __dirname,
			userPermissions: ['KICK_MEMBERS'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'KICK_MEMBERS'],
			description: 'Kick a user.',
			usage: 'kick <user> [reason]',
			cooldown: 5000,
			examples: ['kick username spamming chat'],
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
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/kick:USAGE')) }).then(m => m.timedDelete({ timeout: 10000 }));


		// Get members mentioned in message
		const members = await message.getMember(false);

		// Make sure atleast a guildmember was found
		if (!members[0]) return message.channel.error('moderation/ban:MISSING_USER').then(m => m.timedDelete({ timeout: 10000 }));

		const	reason = message.args[1] ? message.args.splice(1, message.args.length).join(' ') : message.translate('misc:NO_REASON');

		// Make sure user isn't trying to punish themselves

		if (members[0].user.id == message.author.id) return message.channel.error('misc:SELF_PUNISH').then(m => m.timedDelete({ timeout: 10000 }));

		// Make sure user does not have ADMINISTRATOR permissions or has a higher role
		if (members[0].permissions.has('ADMINISTRATOR') || members[0].roles.highest.comparePositionTo(message.guild.me.roles.highest) >= 0) {
			return message.channel.error('moderation/kick:TOO_POWERFUL').then(m => m.timedDelete({ timeout: 10000 }));
		}

		// Kick user with reason
		try {
			// send DM to user
			try {
				const embed = new Embed(bot, message.guild)
					.setTitle('moderation/kick:TITLE')
					.setColor(15158332)
					.setThumbnail(message.guild.iconURL())
					.setDescription(message.translate('moderation/kick:DESC', { NAME: message.guild.name }))
					.addField(message.translate('moderation/kick:KICKED'), message.author.tag, true)
					.addField(message.translate('misc:REASON'), reason, true);
				await members[0].send({ embeds: [embed] });
				// eslint-disable-next-line no-empty
			} catch (e) {}

			// kick user from guild
			await members[0].kick({ reason: reason });
			message.channel.success('moderation/kick:SUCCESS', { USER: members[0].user }).then(m => m.timedDelete({ timeout: 3000 }));
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}
}

module.exports = Kick;
