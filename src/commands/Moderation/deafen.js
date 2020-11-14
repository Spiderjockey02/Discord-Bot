module.exports.run = async (bot, message, args, settings) => {
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
	const member = bot.getUsers(message, args);

	// Make sure user isn't trying to punish themselves
	if (member[0].user.id == message.author.id) return message.error(settings.Language, 'MODERATION/SELF_PUNISHMENT').then(m => m.delete({ timeout: 10000 }));

	// Make sure that the user is in a voice channel
	if (member[0].voice.channelID) {
		try {
			await member[0].voice.setDeaf(true);
			message.success(settings.Language, 'MODERATION/SUCCESSFULL_DEAFEN', member[0].user).then(m => m.delete({ timeout: 3000 }));
		} catch(err) {
			// do nothing
		}
	} else {
		message.error(settings.Language, 'MODERATION/NOT_INVOICE', member[0].user).then(m => m.delete({ timeout: 3000 }));
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
