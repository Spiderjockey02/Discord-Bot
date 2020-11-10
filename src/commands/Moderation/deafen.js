module.exports.run = async (bot, message, args, emojis, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();

	// Check if user has deafen permission
	if (!message.member.hasPermission('DEAFEN_MEMBERS')) return message.error(settings.Language, 'USER_PERMISSION', 'DEAFEN_MEMBERS').then(m => m.delete({ timeout: 10000 }));

	// Make sure bot can delete other peoples messages
	if (!message.guild.me.hasPermission('DEAFEN_MEMBERS')) {
		bot.logger.error(`Missing permission: \`DEAFEN_MEMBERS\` in [${message.guild.id}].`);
		return message.error(settings.Language, 'MISSING_PERMISSION', 'DEAFEN_MEMBERS').then(m => m.delete({ timeout: 10000 }));
	}
	// Checks to make sure user is in the server
	const user = bot.GetUser(message, args);

	// Make sure user isn't trying to punish themselves
	if (user.user.id == message.author.id) return message.error(settings.Language, 'MODERATION/SELF_PUNISHMENT').then(m => m.delete({ timeout: 10000 }));

	// Make sure that the user is in a voice channel
	if (user.voice.channelID) {
		try {
			await user.voice.setDeaf(true);
			message.success(settings.Language, 'MODERATION/SUCCESSFUL_DEAFEN', [`${user.user.username}`, `${user.user.discriminator}`]).then(m => m.delete({ timeout: 3000 }));
		} catch(err) {
			// do nothing
		}
	} else {
		message.error(settings.Language, 'MODERATION/NOT_INVOICE', user.user.username).then(m => m.delete({ timeout: 3000 }));
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
	description: 'Deafen a user.',
	usage: '${PREFIX}deafen <user> [time]',
	example: '${PREFIX}deafen @NoseyUser 10m',
};
