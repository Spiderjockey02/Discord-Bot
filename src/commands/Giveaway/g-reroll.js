module.exports.run = async (bot, message, args, settings) => {
	// Make sure the user has the right permissions to use giveaway
	if (!message.member.hasPermission('ADMINISTRATOR')) return message.error(settings.Language, 'USER_PERMISSION', 'ADMINISTRATOR').then(m => m.delete({ timeout: 10000 }));

	// Make sure the message ID of the giveaway embed is entered
	if (!args[0]) {
		if (message.deletable) message.delete();
		return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('g-reroll').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
	}

	// re-roll the giveaway
	const messageID = args[0];
	bot.giveawaysManager.reroll(messageID).then(() => {
		message.sendT(settings.Language, 'GIVEAWAY/SUCCESS_GIVEAWAY', 'rerolled');
	}).catch((err) => {
		bot.logger.error(err);
		message.sendT(settings.Language, 'GIVEAWAY/UNKNOWN_GIVEAWAY', messageID);
	});
};

module.exports.config = {
	command: 'g-reroll',
	aliases: ['giveaway-reroll', 'greroll'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'giveaway reroll',
	category: 'Giveaway',
	description: 'reroll a giveaway',
	usage: '${PREFIX}g-reroll <messageID>',
};
