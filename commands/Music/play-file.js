module.exports.run = async (bot, message, args, emoji, settings) => {
	// check for bot permissions, song/playlist ( and if needed DJ role)
	if (!bot.musicHandler(message, args, emoji, settings)) {
		return;
	}
};
module.exports.config = {
	command: 'play-file',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};
module.exports.help = {
	name: 'radio',
	category: 'Music',
	description: 'Plays a file',
	usage: '${PREFIX}play <file>',
};
