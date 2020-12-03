module.exports.run = async (bot, message, args, settings) => {
	// Check that a song is being played
	const player = bot.manager.players.get(message.guild.id);
	if (!player) return message.error(settings.Language, 'MUSIC/NO_QUEUE').then(m => m.delete({ timeout: 5000 }));

	// Check that user is in the same voice channel
	if (message.member.voice.channel.id !== player.voiceChannel) return message.error(settings.Language, 'MUSIC/NOT_VOICE').then(m => m.delete({ timeout: 5000 }));

	// Change bassboost value
	player.setDistortion(player.distortion);
	message.channel.send(`Distortion is ${!player.distortion}`);
};

module.exports.config = {
	command: 'distortion',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};

module.exports.help = {
	name: 'Distortion',
	category: 'Music',
	description: 'Toggles distortion audio affect.',
	usage: '${PREFIX}distortion',
};
