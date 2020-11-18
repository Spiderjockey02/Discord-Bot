module.exports.run = async (bot, message, args, settings) => {
	// Make sure the user has the right permissions to use giveaway
	if (!message.member.hasPermission('ADMINISTRATOR')) return message.error(settings.Language, 'USER_PERMISSION', 'ADMINISTRATOR').then(m => m.delete({ timeout: 10000 }));

	// Make sure the message ID of the giveaway embed is entered
	if (args.length != 4) {
		if (message.deletable) message.delete();
		return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('g-edit').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
	}


	// Get new Time
	const time = require('../../helpers/time-converter.js').getTotalTime(args[1], message, settings.Language);
	if (!time) return;

	// Get new winner count
	if (isNaN(args[3])) {
		if (message.deletable) message.delete();
		return message.error(settings.Language, 'GIVEAWAY/INCORRECT_WINNER_COUNT').then(m => m.delete({ timeout: 5000 }));
	}

	// Update giveaway
	bot.giveawaysManager.edit(args[0], {
		newWinnerCount: args[3],
		newPrize: args[2],
		addTime: time,
	}).then(() => {
		message.sendT(settings.Language, 'GIVEAWAY/EDIT_GIVEAWAY', `${bot.giveawaysManager.options.updateCountdownEvery / 1000}`);
	}).catch((err) => {
		bot.logger.error(err);
		message.sendT(settings.Language, 'GIVEAWAY/UNKNOWN_GIVEAWAY', args[0]);
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
	usage: '${PREFIX}g-edit <messageID> <AddedTime> <NewPrize> <newWinnerCount>',
};
