module.exports.run = async (bot, message, args, emojis, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();
	// Get user for nickname change
	const user = (bot.GetUser(message, args)) ? bot.GetUser(message, args) : message.guild.member(message.author);
	// Check if they are changing their own name or not (and check permission)
	if (user == message.author) {
		if (!message.member.hasPermission('CHANGE_NICKNAMES')) {
			message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} You are missing the permission: \`CHANGE_NICKNAMES\`.` } }).then(m => m.delete({ timeout: 10000 }));
			return;
		}
	} else if (!message.member.hasPermission('MANAGE_NICKNAMES')) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} You are missing the permission: \`MANAGE_NICKNAMES\`.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Make sure the bot can change other user's nicknames
	if (!message.guild.me.hasPermission('MANAGE_NICKNAMES')) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} I am missing the permission: \`MANAGE_NICKNAMES\`.` } }).then(m => m.delete({ timeout: 10000 }));
		bot.logger.error(`Missing permission: \`MANAGE_NICKNAMES\` in [${message.guild.id}].`);
		return;
	}
	// Make sure a nickname was provided in the command
	if (args.length == 0) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please enter a nickname.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Get the nickanme
	const nickname = message.content.slice(6).replace(/<[^}]*>/, '').slice(1);
	// Make sure nickname is NOT longer than 32 characters
	if (nickname.length >= 32) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Nickname must be shorter than 32 characters.` } }).then(m => m.delete({ timeout: 5000 }));
		return;
	}
	// Change nickname and tell user (send error message if dosen't work)
	try {
		await user.setNickname(nickname);
		message.channel.send({ embed:{ color:3066993, description:`${emojis[1]} *Successfully changed nickname of ${user.user.username}#${user.user.discriminator}.*` } }).then(m => m.delete({ timeout: 5000 }));
	} catch (err) {
		bot.logger.error(`${err.message} when running command: nick.`);
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} I am unable to change ${user.user.username}#${user.user.discriminator} nickname.` } }).then(m => m.delete({ timeout: 10000 }));
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
	description: 'Nickname a user',
	usage: '${PREFIX}nick <user> <name>',
	example: '${PREFIX}nick @ben Not ben',
};
