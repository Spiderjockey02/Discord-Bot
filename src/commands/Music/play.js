// Dependencies
const Command = require('../../structures/Command.js');

module.exports = class Play extends Command {
	constructor(bot) {
		super(bot, {
			name: 'play',
			dirname: __dirname,
			aliases: ['p'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Play a song.',
			usage: 'play <link | song name>',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Check if the member has role to interact with music plugin
		console.log(message.member._roles);
		if (settings.MusicDJRole != '00') {
			console.log('1');
			if (message.member._roles) {
				console.log('2');
				if (!message.member._roles.has(settings.MusicDJRole)) {
					return message.error(settings.Language, 'MUSIC/MISSING_DJROLE').then(m => m.delete({ timeout: 10000 }));
				}
			}
		}

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

		// Create player
		const player = bot.manager.create({
			guild: message.guild.id,
			voiceChannel: message.member.voice.channel.id,
			textChannel: message.channel.id,
			selfDeafen: true,
		});

		if (args.length == 0) return message.channel.send('No');

		let res;
		const search = args.join(' ');
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
				console.log(res.tracks[0].track);
				console.log(res.tracks[0].title);
				message.channel.send({ embed: { color: message.member.displayHexColor, description:`Added to queue: [${res.tracks[0].title}](${res.tracks[0].uri})` } });
			}
		}
	}
};
