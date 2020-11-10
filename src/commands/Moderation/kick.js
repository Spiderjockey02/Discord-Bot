module.exports.run = async (bot, message, args, emojis, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();

	// Check if user has permission to kick user
	if (!message.member.hasPermission('KICK_MEMBERS')) return message.error(settings.Language, 'USER_PERMISSION', 'KICK_MEMBERS').then(m => m.delete({ timeout: 10000 }));

	// Check if bot has permission to kick user
	if (!message.guild.me.hasPermission('KICK_MEMBERS')) {
		bot.logger.error(`Missing permission: \`KICK_MEMBERS\` in [${message.guild.id}].`);
		return message.error(settings.Language, 'MISSING_PERMISSION', 'KICK_MEMBERS').then(m => m.delete({ timeout: 10000 }));
	}

	// Get user and reason
	const user = bot.GetUser(message, args);
	const reason = (args.join(' ').slice(22)) ? args.join(' ').slice(22) : message.translate(settings.Language, 'NO_REASON');

	// Make sure user isn't trying to punish themselves
	if (user.user.id == message.author.id) return message.error(settings.Language, 'MODERATION/SELF_PUNISHMENT').then(m => m.delete({ timeout: 10000 }));

	// Make sure user user does not have ADMINISTRATOR permissions
	if (user.hasPermission('ADMINISTRATOR')) return message.error(settings.Language, 'MODERATION/TOO_POWERFUL').then(m => m.delete({ timeout: 10000 }));

	// Kick user with reason
	try {
		await user.kick({ reason: reason });
		message.success(settings.Language, 'MODERATION/SUCCESSFULL_KICK', [user.user.username, user.user.discriminator]).then(m => m.delete({ timeout: 3000 }));
		bot.Stats.KickedUsers++;
	} catch (err) {
		if (bot.config.debug) bot.logger.error(`${err.message} - command: kick.`);
		message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'kick',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'KICK_MEMBERS'],
};

module.exports.help = {
	name: 'Kick',
	category: 'Moderation',
	description: 'Kick a user.',
	usage: '${PREFIX}kick <user> [reason]',
	example: '${PREFIX}kick @AnnoyingUser Spamming chat',
};
