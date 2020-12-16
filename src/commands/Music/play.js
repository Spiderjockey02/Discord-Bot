module.exports.run = async (bot, message, args, settings) => {
	// make sure user is in a voice channel
	if (!message.member.voice.channel) return message.error(settings.Language, 'MUSIC/MISSING_VOICE');

	// Check that user is in the same voice channel
	if (bot.manager.players.get(message.guild.id)) {
		if (message.member.voice.channel.id != bot.manager.players.get(message.guild.id).voiceChannel) return message.error(settings.Language, 'MUSIC/NOT_VOICE').then(m => m.delete({ timeout: 5000 }));
	}

	// Check if bot has permission to connect to voice channel
	if (!message.member.voice.channel.permissionsFor(message.guild.me).has('CONNECT')) {
		bot.logger.error(`Missing permission: \`CONNECT\` in [${message.guild.id}].`);
		return message.error(settings.Language, 'MISSING_PERMISSION', 'CONNECT').then(m => m.delete({ timeout: 10000 }));
	}

	// Check if bot has permission to speak in the voice channel
	if (!message.member.voice.channel.permissionsFor(message.guild.me).has('SPEAK')) {
		bot.logger.error(`Missing permission: \`SPEAK\` in [${message.guild.id}].`);
		return message.error(settings.Language, 'MISSING_PERMISSION', 'SPEAK').then(m => m.delete({ timeout: 10000 }));
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
		// Connect to voice channel if not already
		if (player.state !== 'CONNECTED') player.connect();
		// Show how many songs have been added
		message.channel.send({ embed:{ color: message.member.displayHexColor, description: `Queued **${res.tracks.length}** tracks` } });
		// Add songs to queue
		player.queue.add(res.tracks);
		// PLay the song(s) if not already
		if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();
	} else {
		// add track to queue and play
		if (player.state !== 'CONNECTED') player.connect();
		player.queue.add(res.tracks[0]);
		if (!player.playing && !player.paused && !player.queue.size) {
			player.play();
		} else {
			message.channel.send({ embed: { color: message.member.displayHexColor, description:`Added to queue: [${res.tracks[0].title}](${res.tracks[0].url})` } });
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
