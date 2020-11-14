module.exports.run = async (bot, message, args, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();

	// Make sure user can ban users
	if (!message.member.hasPermission('BAN_MEMBERS')) return message.error(settings.Language, 'USER_PERMISSION', 'BAN_MEMBERS').then(m => m.delete({ timeout: 10000 }));


	// Check if bot has permission to ban user
	if (!message.guild.me.hasPermission('BAN_MEMBERS')) {
		bot.logger.error(`Missing permission: \`BAN_MEMBERS\` in [${message.guild.id}].`);
		return message.error(settings.Language, 'MISSING_PERMISSION', 'BAN_MEMBERS').then(m => m.delete({ timeout: 10000 }));
	}

	// Unban user
	const user = args[0];
	try {
		message.guild.fetchBans().then(bans => {
			if (bans.size == 0) return;
			const bUser = bans.find(ban => ban.user.id == user);
			if (!bUser) return;
			message.guild.members.unban(bUser.user);
			message.success(settings.Language, 'MODERATION/SUCCESSFULL_UNBAN', bUser.user).then(m => m.delete({ timeout: 3000 }));
		});
	} catch (err) {
		if (bot.config.debug) bot.logger.error(`${err.message} - command: unban.`);
	}
};

module.exports.config = {
	command: 'unban',
	aliases: ['un-ban'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'BAN_MEMBERS'],
};

module.exports.help = {
	name: 'Unban',
	category: 'Moderation',
	description: 'Unban a user.',
	usage: '${PREFIX}unban <user> [reason]',
	example: '${PREFIX}unban @BadPerson wasn\'t that bad actually.',
};
