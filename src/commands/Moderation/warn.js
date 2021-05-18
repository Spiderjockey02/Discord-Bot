// Dependencies
const	Command = require('../../structures/Command.js');

module.exports = class Warn extends Command {
	constructor(bot) {
		super(bot, {
			name: 'warn',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['warning'],
			userPermissions: ['KICK_MEMBERS'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'KICK_MEMBERS'],
			description: 'Warn a user.',
			usage: 'warn <user> [time] [reason]',
			cooldown: 5000,
			examples: ['warn username', 'warn username 3m bad'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Check to see if user can kick members
		if (!message.member.hasPermission('KICK_MEMBERS')) return message.channel.error(settings.Language, 'USER_PERMISSION', 'KICK_MEMBERS').then(m => m.delete({ timeout: 10000 }));

		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/warn:USAGE')) }).then(m => m.delete({ timeout: 5000 }));

		// Get user to warn
		const member = message.getMember();

		// Make sure user isn't trying to punish themselves
		if (member[0].user.id == message.author.id) return message.channel.error(settings.Language, 'MODERATION/SELF_PUNISHMENT').then(m => m.delete({ timeout: 10000 }));

		// Make sure user does not have ADMINISTRATOR permissions or has a higher role
		if (member[0].hasPermission('ADMINISTRATOR') || member[0].roles.highest.comparePositionTo(message.guild.me.roles.highest) >= 0) {
			return message.channel.error(settings.Language, 'MODERATION/TOO_POWERFUL').then(m => m.delete({ timeout: 10000 }));
		}

		// Get reason for warning
		const wReason = message.args[1] ? message.args.splice(1, message.args.length).join(' ') : message.translate('misc:NO_REASON');

		// Warning is sent to warning manager
		try {
			await require('../../helpers/warningSystem').run(bot, message, member[0], wReason, settings);
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
