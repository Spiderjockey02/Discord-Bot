module.exports.run = async (bot, message, args, emoji, settings) => {
	if (message.deletable) message.delete();
	// Check if user can mute users
	if (!message.member.hasPermission('MUTE_MEMBERS')) {
		message.channel.send({ embed:{ color:15158332, description:`${emoji} You are missing the permission: \`MUTE_MEMBERS\`.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// check if bot can add 'mute' role to user
	if (!message.guild.me.hasPermission('MANAGE_ROLES')) {
		message.channel.send({ embed:{ color:15158332, description:`${emoji} I am missing the permission: \`MANAGE_ROLES\`.` } }).then(m => m.delete({ timeout: 10000 }));
		bot.logger.error(`Missing permission: \`MANAGE_ROLES\` in [${message.guild.id}].`);
		return;
	}
	// Check if bot can mute users
	if (!message.guild.me.hasPermission('MUTE_MEMBERS')) {
		message.channel.send({ embed:{ color:15158332, description:`${emoji} I am missing the permission: \`MUTE_MEMBERS\`.` } }).then(m => m.delete({ timeout: 10000 }));
		bot.logger.error(`Missing permission: \`MUTE_MEMBERS\` in [${message.guild.id}].`);
		return;
	}
	// Find user
	const user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
	if (!user) {
		message.channel.send({ embed:{ color:15158332, description:`${emoji} I was unable to find this user.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Remove mutedRole from user
	try {
		const muteRole = message.guild.roles.cache.find(role => role.name == settings.MutedRole);
		user.roles.remove(muteRole);
		if (user.voice.channelID) {
			user.voice.setMute(false);
		}
		message.channel.send({ embed:{ color:3066993, description:`${bot.config.emojis.tick} *${user.user.username}#${user.user.discriminator} was successfully unmuted*.` } }).then(m => m.delete({ timeout: 3000 }));
	} catch (error) {
		bot.logger.error(`${error.message ? error.message : error}`);
	}
};

module.exports.config = {
	command: 'unmute',
	aliases: ['un-mute'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_ROLES', 'MUTE_MEMBERS'],
};

module.exports.help = {
	name: 'Unmute',
	category: 'moderation',
	description: 'Unmutes a user',
	usage: '${PREFIX}unmute <user>',
};
