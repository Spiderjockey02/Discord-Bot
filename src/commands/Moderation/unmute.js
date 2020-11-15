module.exports.run = async (bot, message, args, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();

	// Check if user can mute users
	if (!message.member.hasPermission('MUTE_MEMBERS')) return message.error(settings.Language, 'USER_PERMISSION', 'MUTE_MEMBERS').then(m => m.delete({ timeout: 10000 }));

	// check if bot can add 'mute' role to user
	if (!message.guild.me.hasPermission('MANAGE_ROLES')) {
		bot.logger.error(`Missing permission: \`MANAGE_ROLES\` in [${message.guild.id}].`);
		return message.error(settings.Language, 'MISSING_PERMISSION', 'MANAGE_ROLES').then(m => m.delete({ timeout: 10000 }));
	}

	// Check if bot can mute users
	if (!message.guild.me.hasPermission('MUTE_MEMBERS')) {
		bot.logger.error(`Missing permission: \`MUTE_MEMBERS\` in [${message.guild.id}].`);
		return message.error(settings.Language, 'MISSING_PERMISSION', 'MUTE_MEMBERS').then(m => m.delete({ timeout: 10000 }));
	}

	// Find user
	const member = bot.getUsers(message, args);
	// Remove mutedRole from user
	try {
		const muteRole = message.guild.roles.cache.find(role => role.id == settings.MutedRole);
		member[0].roles.remove(muteRole);
		if (member[0].voice.channelID) {
			member[0].voice.setMute(false);
		}
		message.success(settings.Language, 'MODERATION/SUCCESSFULL_UNMUTE', member[0].user).then(m => m.delete({ timeout: 3000 }));
	} catch (err) {
		if (bot.config.debug) bot.logger.error(`${err.message} - command: unmute.`);
	}
};

module.exports.config = {
	command: 'unmute',
	aliases: ['un-mute'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_ROLES', 'MUTE_MEMBERS'],
};

module.exports.help = {
	name: 'Unmute',
	category: 'Moderation',
	description: 'Unmute a user.',
	usage: '${PREFIX}unmute <user> ',
	example: '${PREFIX}unmute NoisyUser',
};
