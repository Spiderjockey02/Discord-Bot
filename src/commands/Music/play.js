// Dependencies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Play extends Command {
	constructor(bot) {
		super(bot, {
			name: 'play',
			dirname: __dirname,
			aliases: ['p'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
			description: 'Play a song.',
			usage: 'play <link / song name>',
			cooldown: 3000,
			examples: ['play palaye royale', 'play <attachment>', 'play https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
			slash: true,
			options: [{
                name: "track",
                description: "The link or name of the track.",
                type: 3,
                required: true
            }]
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Check if the member has role to interact with music plugin
		if (message.guild.roles.cache.get(settings.MusicDJRole)) {
			if (!message.member.roles.cache.has(settings.MusicDJRole)) {
				return message.channel.error('misc:MISSING_ROLE').then(m => m.delete({ timeout: 10000 }));
			}
		}

		// make sure user is in a voice channel
		if (!message.member.voice.channel) return message.channel.error('music/play:NOT_VC');

		// Check that user is in the same voice channel
		if (bot.manager.players.get(message.guild.id)) {
			if (message.member.voice.channel.id != bot.manager.players.get(message.guild.id).voiceChannel) return message.channel.error('misc:NOT_VOICE').then(m => m.delete({ timeout: 10000 }));
		}

		// Create player
		let player;
		try {
			player = bot.manager.create({
				guild: message.guild.id,
				voiceChannel: message.member.voice.channel.id,
				textChannel: message.channel.id,
				selfDeafen: true,
			});
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}

		// Make sure something was entered
		if (message.args.length == 0) {
			// Check if a file was uploaded to play instead
			const fileTypes = ['mp3', 'mp4', 'wav', 'm4a', 'webm', 'aac', 'ogg'];
			if (message.attachments.size > 0) {
				const url = message.attachments.first().url;
				for (let i = 0; i < fileTypes.length; i++) {
					if (url.endsWith(fileTypes[i])) {
						message.args.push(url);
					}
				}
				if (!message.args[0]) return message.channel.error('music/play:INVALID_FILE').then(m => m.delete({ timeout: 10000 }));
			} else {
				return message.channel.error('music/play:NO_INPUT').then(m => m.delete({ timeout: 10000 }));
			}
		}

		// Get search query
		let res;
		const search = message.args.join(' ');

		// Search for track
		try {
			res = await player.search(search, message.author);
			if (res.loadType === 'LOAD_FAILED') {
				if (!player.queue.current) player.destroy();
				throw res.exception;
			}
		} catch (err) {
			return message.channel.error('music/play:ERROR', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}
		// Workout what to do with the results
		if (res.loadType == 'NO_MATCHES') {
			// An error occured or couldn't find the track
			if (!player.queue.current) player.destroy();
			return message.channel.error('music/play:NO_SONG');

		} else if (res.loadType == 'PLAYLIST_LOADED') {
			// Connect to voice channel if not already
			if (player.state !== 'CONNECTED') player.connect();

			// Show how many songs have been added
			const embed = new Embed(bot, message.guild)
				.setColor(message.member.displayHexColor)
				.setDescription(message.translate('music/play:QUEUED', { NUM: res.tracks.length }));
			message.channel.send(embed);

			// Add songs to queue and then pLay the song(s) if not already
			player.queue.add(res.tracks);
			if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();
		} else {
			// add track to queue and play
			if (player.state !== 'CONNECTED') player.connect();
			player.queue.add(res.tracks[0]);
			if (!player.playing && !player.paused && !player.queue.size) {
				player.play();
			} else {
				const embed = new Embed(bot, message.guild)
					.setColor(message.member.displayHexColor)
					.setDescription(message.translate('music/play:SONG_ADD', { TITLE: res.tracks[0].title, URL: res.tracks[0].uri }));
				message.channel.send(embed);
			}
		}
	}
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channel_id);
		const search = args[0].value;
		const member = guild.members.cache.get(interaction.member.user.id);
		const author = bot.users.cache.get(interaction.member.user.id);

		if (guild.roles.cache.get(guild.settings.MusicDJRole)) {
			if (!member.roles.cache.has(guild.settings.MusicDJRole)) {
				return await bot.send(channel.error('misc:MISSING_ROLE')).then(m => m.delete({ timeout: 10000 }));
			}
		}

		// make sure user is in a voice channel
		if (!member.voice.channel) return await bot.send(channel.error('music/play:NOT_VC'));

		// Check that user is in the same voice channel
		if (bot.manager.players.get(guild.id)) {
			if (member.voice.channel.id != bot.manager.players.get(guild.id).voiceChannel) return await bot.send(channel.error('misc:NOT_VOICE')).then(m => m.delete({ timeout: 10000 }));
		}

		// Create player
		let player;
		try {
			player = bot.manager.create({
				guild: guild.id,
				voiceChannel: member.voice.channel.id,
				textChannel: channel.id,
				selfDeafen: true,
			});
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return await bot.send(channel.error('misc:ERROR_MESSAGE', { ERROR: err.message })).then(m => m.delete({ timeout: 5000 }));
		}

		// Search for track
		try {
			res = await player.search(search, author);
			console.log("RESSS")
			console.log(res)
			if (res.loadType === 'LOAD_FAILED') {
				if (!player.queue.current) player.destroy();
				throw res.exception;
			}
		} catch (err) {
			return await bot.send(channel.error('music/play:ERROR', { ERROR: err.message })).then(m => m.delete({ timeout: 5000 }));
		}
		// Workout what to do with the results
		if (res.loadType == 'NO_MATCHES') {
			// An error occured or couldn't find the track
			if (!player.queue.current) player.destroy();
			return await bot.send(channel.error('music/play:NO_SONG'));

		} else if (res.loadType == 'PLAYLIST_LOADED') {
			// Connect to voice channel if not already
			if (player.state !== 'CONNECTED') player.connect();

			// Show how many songs have been added
			const embed = new Embed(bot, guild)
				.setColor(member.displayHexColor)
				.setDescription(bot.translate('music/play:QUEUED', { NUM: res.tracks.length }));

			// Add songs to queue and then pLay the song(s) if not already
			player.queue.add(res.tracks);
			if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();

			return await bot.send((embed));
		} else {
			// add track to queue and play
			if (player.state !== 'CONNECTED') player.connect();
			player.queue.add(res.tracks[0]);
			if (!player.playing && !player.paused && !player.queue.size) {
				player.play();
			} else {
				const embed = new Embed(bot, guild)
					.setColor(member.displayHexColor)
					.setDescription(bot.translate('music/play:SONG_ADD', { TITLE: res.tracks[0].title, URL: res.tracks[0].uri }));
				return await bot.send(embed);
			}
		}
	}
};