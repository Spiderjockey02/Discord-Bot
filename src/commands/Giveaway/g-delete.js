module.exports.run = async (bot, message, args, settings) => {
	// Make sure the user has the right permissions to use giveaway
	if (!message.member.hasPermission('ADMINISTRATOR')) return message.error(settings.Language, 'USER_PERMISSION', 'ADMINISTRATOR').then(m => m.delete({ timeout: 10000 }));

	// Make sure the message ID of the giveaway embed is entered
	if (!args[0]) {
		if (message.deletable) message.delete();
		return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('g-delete').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
	}

	// Delete the giveaway
	const messageID = args[0];
	bot.giveawaysManager.delete(messageID).then(() => {
		message.sendT(settings.Language, 'GIVEAWAY/SUCCESS_GIVEAWAY', 'deleted');
	}).catch((err) => {
		bot.logger.error(err);
		message.sendT(settings.Language, 'GIVEAWAY/UNKNOWN_GIVEAWAY', messageID);
	});
};

module.exports.config = {
	command: 'g-delete',
	aliases: ['giveaway-delete', 'gdelete'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'G-delete',
	category: 'Giveaway',
	description: 'Delete a giveaway',
	usage: '${PREFIX}g-delete <messageID>',
};
