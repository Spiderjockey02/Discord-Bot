module.exports.run = async (bot, message, args, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();

	// Check to see if user can kick members
	if (!message.member.hasPermission('KICK_MEMBERS')) return message.error(settings.Language, 'USER_PERMISSION', 'KICK_MEMBERS').then(m => m.delete({ timeout: 10000 }));

	if (!args[0]) return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('warn').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));

	// Get user to warn
	const member = bot.getUsers(message, args);

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
		console.log(err);
		if (bot.config.debug) bot.logger.error(`${err.message} - command: warn.`);
		message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
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
