module.exports.run = async (bot, message, args, emoji) => {
	if (message.deletable) message.delete();
	// Check if user has permission to ban user
	if (!message.member.hasPermission('BAN_MEMBERS')) {
		message.channel.send({ embed:{ color:15158332, description:`${emoji} You are missing the permission: \`BAN_MEMBERS\`.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Check if bot has permission to unban user
	if (!message.guild.me.hasPermission('BAN_MEMBERS')) {
		message.channel.send({ embed:{ color:15158332, description:`${emoji} I am missing the permission: \`BAN_MEMBERS\`.` } }).then(m => m.delete({ timeout: 10000 }));
		bot.logger.error(`Missing permission: \`BAN_MEMBERS\` in [${message.guild.id}]`);
		return;
	}
	// Unban user
	const user = args[0];
	try {
		message.guild.fetchBans().then(bans => {
			if (bans.size == 0) return;
			const bUser = bans.find(ban => ban.user.id == user);
			if (!bUser) return;
			message.guild.members.unban(bUser.user);
			console.log(bUser);
			message.channel.send({ embed:{ color:3066993, description:`${bot.config.emojis.tick} *${bUser.user.username}#${bUser.user.discriminator} was successfully unbanned*.` } }).then(m => m.delete({ timeout: 3000 }));
		});
	} catch (error) {
		bot.logger.error(`${error.message ? error.message : error}`);
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
};
