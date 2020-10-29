module.exports.run = async (bot, message, args, emojis, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();
	// Check if user has deafen permission
	if (!message.member.hasPermission('DEAFEN_MEMBERS')) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} You are missing the permission: \`DEAFEN_MEMBERS\` to run this command.` } }).then(m => m.delete({ timeout: 15000 }));
		return;
	}
	// Make sure bot can delete other peoples messages
	if (!message.guild.me.hasPermission('DEAFEN_MEMBERS')) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} I am missing the permission: \`DEAFEN_MEMBERS\`.` } }).then(m => m.delete({ timeout: 15000 }));
		bot.logger.error(`Missing permission: \`DEAFEN_MEMBERS\` in [${message.guild.id}].`);
		return;
	}
	// Checks to make sure user is in the server
	const user = bot.GetUser(message, args);
	if (!user) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} I was unable to find this user.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	try {
		await user.voice.setDeaf(false);
		message.channel.send({ embed:{ color:3066993, description:`${emojis[1]} *${user.user.username}#${user.user.discriminator} was successfully undeafened*.` } }).then(m => m.delete({ timeout: 3000 }));
	} catch (err) {
		bot.logger.error(`${err.message} when running command: undeafen.`);
	}
};

module.exports.config = {
	command: 'undeafen',
	aliases: ['undeaf', 'un-deafen'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'DEAFEN_MEMBERS'],
};

module.exports.help = {
	name: 'Undeafen',
	category: 'Moderation',
	description: 'Undeafen a user.',
	usage: '${PREFIX}undeafen <user>',
	example: '${PREFIX}undeafen @NoseyUser',
};
