module.exports.run = async (bot, message, args) => {
	if (message.deletable) message.delete();
	// Check if user has permission to kick user
	if (!message.member.hasPermission('KICK_MEMBERS')) {
		message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} You are missing the permission: \`KICK_MEMBERS\`.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Check if bot has permission to kick user
	if (!message.guild.me.hasPermission('KICK_MEMBERS')) {
		message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} I am missing the permission: \`KICK_MEMBERS\`.` } }).then(m => m.delete({ timeout: 10000 }));
		bot.logger.error(`Missing permission: \`KICK_MEMBERS\` in [${message.guild.id}]`);
		return;
	}
	// Get user and reason
	const kicked = message.mentions.users.first() || bot.users.resolve(args[0]);
	const reason = (args.join(' ').slice(22)) ? args.join(' ').slice(22) : 'No reason given';
	// Make sure user is real
	if (!kicked) {
		message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} I was unable to find this user.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Kick user with reason
	try {
		message.guild.member(kicked).kick({ reason: reason });
		message.channel.send({ embed:{ color:3066993, description:`${bot.config.emojis.tick} *${kicked.username} was successfully kicked*.` } }).then(m => m.delete({ timeout: 3000 }));
	} catch (error) {
		bot.logger.error(`${error.message ? error.message : error}`);
	}
};

module.exports.config = {
	command: 'kick',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'KICK_MEMBERS'],
};

module.exports.help = {
	name: 'Kick',
	category: 'moderation',
	description: 'Kicks a user.',
	usage: '!kick {user} [reason]',
};
