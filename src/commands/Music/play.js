module.exports.run = async (bot, message, args, settings) => {
	// make sure user is in a voice channel
	if (!message.member.voice.channel) return message.error(settings.Language, 'MUSIC/MISSING_VOICE');

	// Check that user is in the same voice channel
	if (bot.manager.players.get(message.guild.id)) {
		if (message.member.voice.channel.id && bot.manager.players.get(message.guild.id).voiceChannel) return message.error(settings.Language, 'MUSIC/NOT_VOICE').then(m => m.delete({ timeout: 5000 }));
	}

	// Make sure that a song/url has been entered
	if (!args) return message.error(settings.Language, 'MUSIC/NO_ARGS');

	// Create player
	const player = bot.manager.create({
		guild: message.guild.id,
		voiceChannel: message.member.voice.channel.id,
		textChannel: message.channel.id,
		selfDeafen: true,
	});

	const search = args.join(' ');
	let res;

	// Search for track
	try {
		res = await player.search(search, message.author);
		if (res.loadType === 'LOAD_FAILED') {
			if (!player.queue.current) player.destroy();
			throw res.exception;
		}
	} catch (err) {
		return message.error(settings.Language, 'MUSIC/ERROR', err.message);
	}

	// Workout what to do with the results
	if (res.loadType == 'NO_MATCHES') {
		// An error occured or couldn't find the track
		if (!player.queue.current) player.destroy();
		return message.error(settings.Language, 'MUSIC/NO_SONG');
	} else if (res.loadType == 'PLAYLIST_LOADED') {
		// Add playlist to queue
		if (player.state !== 'CONNECTED') player.connect();
		player.queue.add(res.tracks);
		if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) {
			player.play();
		} else {
			message.channel.send({ embed:{ description: `Queued **${res.tracks.length}** tracks` } });
		}
	} else {
		// add track to queue and play
		if (player.state !== 'CONNECTED') player.connect();
		player.queue.add(res.tracks[0]);
		if (!player.playing && !player.paused && !player.queue.size) {
			player.play();
		} else {
			message.channel.send(`Added to queue: [${res.tracks[0].title}]`);
		}
	}
};


module.exports.config = {
	command: 'play',
	aliases: ['p'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};

module.exports.help = {
	name: 'play',
	category: 'Music',
	description: 'Play a song.',
	usage: '${PREFIX}play <link | song name>',
};
