module.exports.run = async (bot, message, args, emojis, settings) => {
	if (message.deletable) message.delete();
};

module.exports.config = {
	command: 'language',
	aliases: ['lang'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Language',
	category: 'Moderation',
	description: 'Changes the language of the bot.',
	usage: '${PREFIX}language [language]',
	example: '${PREFIX}language french',
};
