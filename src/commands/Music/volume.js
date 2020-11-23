module.exports.run = async (bot, message, args, settings) => {
	// Check that a song is being played
	const player = bot.manager.players.get(message.guild.id);
	if (!player) return message.error(settings.Language, 'MUSIC/NO_QUEUE').then(m => m.delete({ timeout: 5000 }));

	// Check that user is in the same voice channel
	if (message.member.voice.channel.id !== player.voiceChannel) return message.error(settings.Language, 'MUSIC/NOT_VOICE').then(m => m.delete({ timeout: 5000 }));

	// Make sure a correct volume was entered
	if (!args[0]) return message.channel.send(`:loud_sound: The current volume is: **${player.volume}%**.`);
	if (Number(args) <= 0 || Number(args) > 100) return message.channel.send('Please input a number between 0 and 100');

	// Update volume
	player.setVolume(Number(args));
	return message.channel.send(`:loud_sound: Player sound set to **${player.volume}%**.`);
};

module.exports.config = {
	command: 'volume',
	aliases: ['vol'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'volume',
	category: 'Music',
	description: 'Changes the volume of the song',
	usage: '${PREFIX}volume <Number>',
};
