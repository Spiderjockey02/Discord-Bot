module.exports.run = async (bot, message, args, settings) => {
	// make sure user is in a voice channel
	if (!message.member.voice.channel) return message.channel.send('You\'re not in a voice channel that I can connect to.');

	// Check that user is in the same voice channel
	if (message.member.voice.channel.id !== player.voiceChannel) return message.error(settings.Language, 'MUSIC/NOT_VOICE').then(m => m.delete({ timeout: 5000 }));

	// Make sure that a song/url has been entered
	if (!args) return message.channel.send('Please enter a song name/url');

	// Create player
	const player = bot.manager.create({
		guild: message.guild.id,
		voiceChannel: message.member.voice.channel.id,
		textChannel: message.channel.id,
	});

	if (player.state !== 'CONNECTED') player.connect();
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
		return message.channel.send(`There was an error while searching: ${err.message}`);
	}
	console.log(res);
	// Workout what to do with the results
	if (res.loadType == 'NO_MATCHES') {
		// An error occured or couldn't find the track
		if (!player.queue.current) player.destroy();
		return message.error(settings.Language, 'MUSIC/NO_SONG');
	} else {
		let max = 5, collected;
		const filter = (m) => m.author.id === message.author.id && /^(\d+|cancel)$/i.test(m.content);
		if (res.tracks.length < max) max = res.tracks.length;

		const results = res.tracks
			.slice(0, max)
			.map((track, index) => `${++index} - \`${track.title}\``)
			.join('\n');

		message.channel.send(results);

		try {
			collected = await message.channel.awaitMessages(filter, { max: 1, time: 30e3, errors: ['time'] });
		} catch (e) {
			if (!player.queue.current) player.destroy();
			return message.reply('you didn\'t provide a selection.');
		}

		const first = collected.first().content;

		if (first.toLowerCase() === 'cancel') {
			if (!player.queue.current) player.destroy();
			return message.channel.send('Cancelled selection.');
		}

		const index = Number(first) - 1;
		if (index < 0 || index > max - 1) return message.reply(`the number you provided too small or too big (1-${max}).`);

		const track = res.tracks[index];
		player.queue.add(track);

		if (!player.playing && !player.paused && !player.queue.size) {
			player.play();
		} else {
			message.channel.send(`Added to queue: [${track.title}]`);
		}
	}
};


module.exports.config = {
	command: 'search',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
};

module.exports.help = {
	name: 'Search',
	category: 'Music',
	description: 'Searches for a song.',
	usage: '${PREFIX}search <link | song name>',
};
