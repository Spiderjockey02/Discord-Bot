module.exports.run = async (bot, message, args, settings) => {
	// Check that a song is being played
	const player = bot.manager.players.get(message.guild.id);
	if (!player) return message.error(settings.Language, 'MUSIC/NO_QUEUE').then(m => m.delete({ timeout: 5000 }));

	// Check that user is in the same voice channel
	if (message.member.voice.channel.id !== player.voiceChannel) return message.error(settings.Language, 'MUSIC/NOT_VOICE').then(m => m.delete({ timeout: 5000 }));

	// The music is already resumed
	if (!player.paused) return message.error(settings.Language, 'MUSIC/ALREADY_RESUMED', settings.prefix);

	// Resumes the music
	player.pause(false);
	return message.success(settings.Language, 'MUSIC/SUCCESFULL_RESUME');
};

module.exports.config = {
	command: 'resume',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};

module.exports.help = {
	name: 'Resume',
	category: 'Music',
	description: 'Resumes the music.',
	usage: '${PREFIX}resume',
};
