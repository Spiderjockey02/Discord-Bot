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
	async run(bot, message, args, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Check to see if user can kick members
		if (!message.member.hasPermission('KICK_MEMBERS')) return message.error(settings.Language, 'USER_PERMISSION', 'KICK_MEMBERS').then(m => m.delete({ timeout: 10000 }));

		if (!args[0]) return message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));

		// Get user to warn
		const member = message.guild.getMember(message, args);

		// Make sure user isn't trying to punish themselves
		if (member[0].user.id == message.author.id) return message.error(settings.Language, 'MODERATION/SELF_PUNISHMENT').then(m => m.delete({ timeout: 10000 }));

		// Make sure that the user that is getting warned has administrator permissions
		if (member[0].hasPermission('ADMINISTRATOR')) return message.error(settings.Language, 'MODERATION/TOO_POWERFUL').then(m => m.delete({ timeout: 10000 }));

		// Get reason for warning
		const wReason = (args.join(' ').slice(22)) ? args.join(' ').slice(22) : message.translate(settings.Language, 'NO_REASON');

		// Warning is sent to warning manager
		try {
			await require('../../helpers/warning-system').run(bot, message, member[0], wReason, settings);
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
