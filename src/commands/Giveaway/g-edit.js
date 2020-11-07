module.exports.run = async (bot, message, args, emojis, settings) => {
	// Make sure the message ID of the giveaway embed is entered
	if (!args[0]) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('g-edit').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	const messageID = args[0];
	// edit the giveaway
	bot.giveawaysManager.edit(messageID, {
		newWinnerCount: 3,
		newPrize: 'New Prize!',
		addTime: 5000,
	}).then(() => {
		message.channel.send('Success! Giveaway will updated in less than ' + (bot.giveawaysManager.options.updateCountdownEvery / 1000) + ' seconds.');
	}).catch((err) => {
		bot.logger.error(err);
		message.channel.send('No giveaway found for ' + messageID + ', please check and try again');
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
