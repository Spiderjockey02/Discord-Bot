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

	// Get user and reason
	const reason = (args.join(' ').slice(22)) ? args.join(' ').slice(22) : message.translate(settings.Language, 'NO_REASON');
	// Make sure user is real
	const member = bot.getUsers(message, args);

	// Make sure user isn't trying to punish themselves
	if (member[0].user.id == message.author.id) return message.error(settings.Language, 'MODERATION/SELF_PUNISHMENT').then(m => m.delete({ timeout: 10000 }));

	// Make sure user user does not have ADMINISTRATOR permissions
	if (member[0].hasPermission('ADMINISTRATOR')) return message.error(settings.Language, 'MODERATION/TOO_POWERFUL').then(m => m.delete({ timeout: 10000 }));

	// Ban user with reason and check if timed ban
	try {
		await member[0].ban({ reason: reason });
		message.success(settings.Language, 'MODERATION/SUCCESSFULL_BAN', member[0].user).then(m => m.delete({ timeout: 8000 }));
		bot.Stats.BannedUsers++;
		const possibleTime = args[args.length - 1];
		if (possibleTime.endsWith('d') || possibleTime.endsWith('h') || possibleTime.endsWith('m') || possibleTime.endsWith('s')) {
			// do tempban
			const time = require('../../helpers/time-converter.js').getTotalTime(possibleTime, message, settings.Language);
			if (!time) return;
			setTimeout(() => {
				bot.commands.get('unban').run(bot, message, [`${member[0].user.id}`], settings);
			}, time);
		}
	} catch (err) {
		if (bot.config.debug) bot.logger.error(`${err.message} - command: ban.`);
		message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'ban',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'BAN_MEMBERS'],
};

module.exports.help = {
	name: 'Ban',
	category: 'Moderation',
	description: 'Ban a user.',
	usage: '${PREFIX}ban <user> [reason] [time]',
	example: '${PREFIX}ban @badPerson Not good 1h',
};
