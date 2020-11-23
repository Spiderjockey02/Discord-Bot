module.exports.run = async (bot, message, args, settings) => {
	message.channel.send('feature coming soon');
};

module.exports.config = {
	command: 'lyrics',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'lyric',
	category: 'Music',
	description: 'Get lyrics on a song.',
	usage: '${PREFIX}lyrics [song]',
};
