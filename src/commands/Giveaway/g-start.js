module.exports.run = async (bot, message, args, settings) => {
	// Make sure the user has the right permissions to use giveaway
	if (!message.member.hasPermission('ADMINISTRATOR')) return message.error(settings.Language, 'USER_PERMISSION', 'ADMINISTRATOR').then(m => m.delete({ timeout: 10000 }));

	// Get time
	const time = require('../../utils/Time-Handler.js').getTotalTime(args[0], message, settings.Language);
	if (!time) return;

	// Make sure that number of winners is a number
	if (isNaN(args[1])) {
		if (message.deletable) message.delete();
		return message.error(settings.Language, 'GIVEAWAY/INCORRECT_WINNER_COUNT').then(m => m.delete({ timeout: 5000 }));
	}

	// Check for prize
	if (!args[2]) {
		if (message.deletable) message.delete();
		return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('g-start').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
	}

	// Start the giveaway
	bot.giveawaysManager.start(message.channel, {
		time: time,
		prize: args.slice(2).join(' '),
		winnerCount: parseInt(args[1]),
	}).then((gData) => {
		console.log(gData);
	});
};

module.exports.config = {
	command: 'g-start',
	aliases: ['gstart', 'giveaway'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'giveaway start',
	category: 'Giveaway',
	description: 'Start a giveaway',
	usage: '${PREFIX}g-start <time> <Number of winners> <prize>',
};
