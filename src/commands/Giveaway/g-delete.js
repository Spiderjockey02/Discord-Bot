module.exports.run = async (bot, message, args, emojis, settings) => {
	// Make sure the message ID of the giveaway embed is entered
	if (!args[0]) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('g-delete').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	const messageID = args[0];
	// delete the giveaway
	bot.giveawaysManager.delete(messageID).then(() => {
		message.channel.send('Success! Giveaway deleted!');
	}).catch((err) => {
		bot.logger.error(err);
		message.channel.send('No giveaway found for ' + messageID + ', please check and try again');
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
