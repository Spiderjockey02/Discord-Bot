module.exports.run = async (bot, message, args, settings) => {
	// Check that a song is being played
	const player = bot.manager.players.get(message.guild.id);
	if (!player) return message.error(settings.Language, 'MUSIC/NO_QUEUE').then(m => m.delete({ timeout: 5000 }));

	// Check that user is in the same voice channel
	if (message.member.voice.channel.id !== player.voiceChannel) return message.error(settings.Language, 'MUSIC/NOT_VOICE').then(m => m.delete({ timeout: 5000 }));

	// Check what to loop (queue or song)
	if (args[0].toLowerCase() == 'song') {
		// (un)loop the song
		player.setTrackRepeat(!player.trackRepeat);
		const trackRepeat = player.trackRepeat ? 'enabled' : 'disabled';
		return message.channel.send(`${trackRepeat} track repeat.`);
	} else if (args[0].toLowerCase() == 'queue') {
		// (un)loop the queue
		player.setQueueRepeat(!player.queueRepeat);
		const queueRepeat = player.queueRepeat ? 'enabled' : 'disabled';
		return message.channel.send(`${queueRepeat} queue repeat.`);
	} else if (args[0].toLowerCase() == 'off') {
		player.setTrackRepeat(false);
		player.setQueueRepeat(false);
		message.channel.send('looping is turned off.');
	} else {
		message.channel.send('Not an option');
	}
};

module.exports.config = {
	command: 'loop',
	aliases: ['repeat'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};

module.exports.help = {
	name: 'Loop',
	category: 'Music',
	description: 'Loops the song or queue.',
	usage: '${PREFIX}loop [queue | song | off]',
};
