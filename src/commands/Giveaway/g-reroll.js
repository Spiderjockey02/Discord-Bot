module.exports.run = async (bot, message, args, emojis, settings) => {
	// Make sure the message ID of the giveaway embed is entered
	if (!args[0]) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('g-reroll').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	const messageID = args[0];
	// re-roll the giveaway
	bot.giveawaysManager.reroll(messageID).then(() => {
		message.channel.send('Success! Giveaway rerolled!');
	}).catch((err) => {
		bot.logger.error(err);
		message.channel.send('No giveaway found for ' + messageID + ', please check and try again');
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
