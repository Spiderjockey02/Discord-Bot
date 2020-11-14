module.exports.run = async (bot, message, args, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();

	// Get user for nickname change
	const member = bot.getUsers(message, args);

	// Check if they are changing their own name or not (and check permission)
	if (member[0] == message.author) {
		if (!message.member.hasPermission('CHANGE_NICKNAMES')) {
			return message.error(settings.Language, 'USER_PERMISSION', 'CHANGE_NICKNAMES').then(m => m.delete({ timeout: 10000 }));
		}
	} else if (!message.member.hasPermission('MANAGE_NICKNAMES')) {
		return message.error(settings.Language, 'USER_PERMISSION', 'MANAGE_NICKNAMES').then(m => m.delete({ timeout: 10000 }));
	}

	// Make sure the bot can change other user's nicknames
	if (!message.guild.me.hasPermission('MANAGE_NICKNAMES')) {
		bot.logger.error(`Missing permission: \`MANAGE_NICKNAMES\` in [${message.guild.id}].`);
		return message.error(settings.Language, 'MISSING_PERMISSION', 'MANAGE_NICKNAMES').then(m => m.delete({ timeout: 10000 }));
	}

	// Make sure a nickname was provided in the command
	if (args.length == 0) return message.error(settings.Language, 'MODERATION/ENTER_NICKNAME').then(m => m.delete({ timeout: 10000 }));

	// Get the nickanme
	const nickname = message.content.slice(6).replace(/<[^}]*>/, '').slice(1);

	// Make sure nickname is NOT longer than 32 characters
	if (nickname.length >= 32) return message.error(settings.Language, 'MODERATION/LONG_NICKNAME').then(m => m.delete({ timeout: 5000 }));

	// Change nickname and tell user (send error message if dosen't work)
	try {
		await member[0].setNickname(nickname);
		message.success(settings.Language, 'MODERATION/SUCCESSFULL_NICK', member[0].user).then(m => m.delete({ timeout: 5000 }));
	} catch (err) {
		if (bot.config.debug) bot.logger.error(`${err.message} - command: nick.`);
		message.error(settings.Language, 'MODERATION/UNSUCCESSFULL_NICK', member[0].user).then(m => m.delete({ timeout: 10000 }));
	}
};

module.exports.config = {
	command: 'nick',
	aliases: ['nickname'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CHANGE_NICKNAME', 'MANAGE_NICKNAMES'],
};

module.exports.help = {
	name: 'Nick',
	category: 'Moderation',
	description: 'Change the nickname of a user.',
	usage: '${PREFIX}nick <user> <name>',
	example: '${PREFIX}nick @ben Not ben',
};
