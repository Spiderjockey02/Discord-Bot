module.exports.run = async (bot, message, args, settings) => {
	// Check that a song is being played
	const player = bot.manager.players.get(message.guild.id);
	if (!player) return message.error(settings.Language, 'MUSIC/NO_QUEUE').then(m => m.delete({ timeout: 5000 }));

	// skip song
	player.stop();
};


module.exports.config = {
	command: 'skip',
	aliases: ['next'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};

module.exports.help = {
	name: 'Skip',
	category: 'Music',
	description: 'Skips the current song.',
	usage: '${PREFIX}skip',
};
