module.exports.run = async (bot, message, args, settings) => {
	// Make sure the message ID of the giveaway embed is entered
	if (!args[0]) {
		if (message.deletable) message.delete();
		return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('g-edit').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
	}

	// edit the giveaway
	const messageID = args[0];
	bot.giveawaysManager.edit(messageID, {
		newWinnerCount: 3,
		newPrize: 'New Prize!',
		addTime: 5000,
	}).then(() => {
		message.sendT(settings.Language, 'GIVEAWAY/EDIT_GIVEAWAY', `${bot.giveawaysManager.options.updateCountdownEvery / 1000}`);
	}).catch((err) => {
		bot.logger.error(err);
		message.sendT(settings.Language, 'GIVEAWAY/UNKNOWN_GIVEAWAY', messageID);
	});
};

module.exports.config = {
	command: 'g-edit',
	aliases: ['giveaway-edit', 'gedit'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'giveaway edit',
	category: 'Giveaway',
	description: 'edit a giveaway',
	usage: '${PREFIX}g-edit <messageID>',
};
