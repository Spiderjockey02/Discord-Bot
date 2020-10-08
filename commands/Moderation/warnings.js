module.exports.run = async (bot, message, args, emoji, settings) => {
	if (message.deletable) message.delete();
	// search for user's warnings
	// if any display them
};

module.exports.config = {
	command: 'warnings',
	aliases: ['warns'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Warnings',
	category: 'Moderation',
	description: 'Shows number of warnings a user has',
	usage: '${PREFIX}warnings [user]',
};
