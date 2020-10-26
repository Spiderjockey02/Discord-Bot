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
	// Make sure that user is in the server
	if (!user) {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} I was unable to find this user.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Make sure that the user is in a voice channel
	if (user.voice.channelID) {
		try {
			await user.voice.setDeaf(true);
			message.channel.send({ embed:{ color:3066993, description:`${emojis[1]} *${user.user.username}#${user.user.discriminator} was successfully deafened*.` } }).then(m => m.delete({ timeout: 3000 }));
		} catch (err) {
			bot.logger.error(`${err.message} when running command: deafen.`);
		}
	} else {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} ${user.user.username} is not in a voice channel. ` } }).then(m => m.delete({ timeout: 3000 }));
	}
};

module.exports.config = {
	command: 'deafen',
	aliases: ['deaf'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'DEAFEN_MEMBERS'],
};

module.exports.help = {
	name: 'Deafen',
	category: 'Moderation',
	description: 'Deafens a user',
	usage: '${PREFIX}deafen <user> [time]',
	example: '${PREFIX}deafen @NoseyUser 10m',
};
