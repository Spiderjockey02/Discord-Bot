module.exports.run = async (bot, message, args, emojis, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();
	// Check if user has permission to kick user
	if (!message.member.hasPermission('KICK_MEMBERS')) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} You are missing the permission: \`KICK_MEMBERS\`.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Check if bot has permission to kick user
	if (!message.guild.me.hasPermission('KICK_MEMBERS')) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} I am missing the permission: \`KICK_MEMBERS\`.` } }).then(m => m.delete({ timeout: 10000 }));
		bot.logger.error(`Missing permission: \`KICK_MEMBERS\` in [${message.guild.id}].`);
		return;
	}
	// Get user and reason
	const user = bot.GetUser(message, args);
	const reason = (args.join(' ').slice(22)) ? args.join(' ').slice(22) : 'No reason given';
	// Make sure user is real
	if (!user) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} I was unable to find this user.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Make sure kicked user does not have ADMINISTRATOR permissions
	if (user.hasPermission('ADMINISTRATOR')) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} I am unable to ban this user due to their power.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Kick user with reason
	try {
		await user.kick({ reason: reason });
		message.channel.send({ embed:{ color:3066993, description:`${emojis[1]} *${user.user.username}#${user.user.discriminator} was successfully kicked*.` } }).then(m => m.delete({ timeout: 3000 }));
		bot.Stats.KickedUsers++;
	} catch (err) {
		bot.logger.error(`${err.message} when running command: kick.`);
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} I am unable to kick this user due to their power.` } }).then(m => m.delete({ timeout: 10000 }));
	}
};

module.exports.config = {
	command: 'kick',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'KICK_MEMBERS'],
};

module.exports.help = {
	name: 'Kick',
	category: 'Moderation',
	description: 'Kicks a user.',
	usage: '${PREFIX}kick <user> [reason]',
	example: '${PREFIX}kick @AnnoyingUser Spamming chat',
};
