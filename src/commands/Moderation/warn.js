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

		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/warn:USAGE')) }).then(m => m.delete({ timeout: 5000 }));

		// Get user to warn
		const members = await message.getMember();

		// Make sure user isn't trying to punish themselves
		if (members[0].user.id == message.author.id) return message.channel.error('misc:SELF_PUNISH').then(m => m.delete({ timeout: 10000 }));

		// Make sure user does not have ADMINISTRATOR permissions or has a higher role
		if (members[0].hasPermission('ADMINISTRATOR') || members[0].roles.highest.comparePositionTo(message.guild.me.roles.highest) >= 0) {
			return message.channel.error('moderation/warn:TOO_POWERFUL').then(m => m.delete({ timeout: 10000 }));
		}

		// Get reason for warning
		const wReason = message.args[1] ? message.args.splice(1, message.args.length).join(' ') : message.translate('misc:NO_REASON');

		// Warning is sent to warning manager
		try {
			await require('../../helpers/warningSystem').run(bot, message, members[0], wReason, settings);
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
