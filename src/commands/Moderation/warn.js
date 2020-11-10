module.exports.run = async (bot, message, args, emojis, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();

	// Check to see if user can kick members
	if (!message.member.hasPermission('KICK_MEMBERS')) return message.error(settings.Language, 'USER_PERMISSION', 'KICK_MEMBERS').then(m => m.delete({ timeout: 10000 }));

	if (!args[0]) return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('warn').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));

	// Get user to warn
	const wUser = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
	if (!wUser) return message.error(settings.Language, 'MISSING_USER').then(m => m.delete({ timeout: 10000 }));

	// Make sure user isn't trying to punish themselves
	if (wUser.user.id == message.author.id) return message.error(settings.Language, 'MODERATION/SELF_PUNISHMENT').then(m => m.delete({ timeout: 10000 }));

	// Make sure that the user that is getting warned has administrator permissions
	if (wUser.hasPermission('ADMINISTRATOR')) return message.error(settings.Language, 'MISSING_USER').then(m => m.delete({ timeout: 10000 }));

	// Get reason for warning
	const wReason = (args.join(' ').slice(22)) ? args.join(' ').slice(22) : message.translate(settings.Language, 'NO_REASON');

	// Warning is sent to warning manager
	try {
		await require('../../modules/plugins/warning').run(bot, message, emojis, wUser, wReason, settings);
	} catch (err) {
		if (bot.config.debug) bot.logger.error(`${err.message} - command: warn.`);
		message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 })).then(m => m.delete({ timeout: 10000 }));
	}
};

module.exports.config = {
	command: 'warn',
	aliases: ['warning'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'KICK_MEMBERS'],
};

module.exports.help = {
	name: 'Warning',
	category: 'Moderation',
	description: 'Warn a user.',
	usage: '${PREFIX}warn <user> [time] [reason]',
	example: '${PREFIX}warn @NaughtyPerson 10m Was spamming chat.',
};
