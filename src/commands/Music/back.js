module.exports.run = async (bot, message, args, settings) => {
	// Check that a song is being played
	const player = bot.manager.players.get(message.guild.id);
	if (!player) return message.error(settings.Language, 'MUSIC/NO_QUEUE').then(m => m.delete({ timeout: 5000 }));

	// Check that user is in the same voice channel
	if (message.member.voice.channel.id !== player.voiceChannel) return message.error(settings.Language, 'MUSIC/NOT_VOICE').then(m => m.delete({ timeout: 5000 }));

	// Make sure there was a previous song
	if (player.queue.previous == null) return message.channel.send('There are no previous songs.');

	// Start playing the previous song
	player.queue.unshift(player.queue.previous);
	player.stop();
};

module.exports.config = {
	command: 'back',
	aliases: ['previous', 'prev'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};

module.exports.help = {
	name: 'Back',
	category: 'Music',
	description: 'Plays the previous song in the queue.',
	usage: '${PREFIX}back',
};
