// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	axios = require('axios'),
	rfc3986EncodeURIComponent = (str) => encodeURIComponent(str).replace(/[!'()*]/g, escape),
	Command = require('../../structures/Command.js');

/**
 * play command
 * @extends {Command}
*/
class Play extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'play',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['p'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.Connect, Flags.Speak],
			description: 'Play a song.',
			usage: 'play <link / song name>',
			cooldown: 3000,
			examples: ['play palaye royale', 'play <attachment>', 'play https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
			slash: true,
			options: [{
				name: 'track',
				description: 'The link or name of the track.',
				type: ApplicationCommandOptionType.String,
				required: true,
				autocomplete: true,
			},
			{
				name: 'flag',
				description: '(R)everse, (S)huffle or (N)ext to queue',
				type: ApplicationCommandOptionType.String,
				choices: ['-r', '-n', '-s'].map(i => ({ name: i, value: i })),
			}],
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(bot, message, settings) {
		// make sure user is in a voice channel
		if (!message.member.voice.channel) return message.channel.error('music/play:NOT_VC');

		// Check that user is in the same voice channel
		if (bot.manager?.players.get(message.guild.id)) {
			if (message.member.voice.channel.id != bot.manager?.players.get(message.guild.id).voiceChannel) return message.channel.error('misc:NOT_VOICE');
		}

		// Check if VC is full and bot can't join doesn't have (Flags.ManageChannels)
		if (message.member.voice.channel.full && !message.member.voice.channel.permissionsFor(message.guild.members.me).has(Flags.MoveMembers)) {
			return message.channel.error('music/play:VC_FULL');
		}

		// Check if the member has role to interact with music plugin
		if (message.guild.roles.cache.get(settings.MusicDJRole)) {
			if (!message.member.roles.cache.has(settings.MusicDJRole)) {
				return message.channel.error('misc:MISSING_ROLE');
			}
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
			return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
		}

		// Make sure something was entered
		if (message.args.length == 0) {
			// Check if a file was uploaded to play instead
			const fileTypes = ['mp3', 'mp4', 'wav', 'm4a', 'webm', 'aac', 'ogg'];
			if (message.attachments.size > 0) {
				const url = message.attachments.first().url;
				for (const type of fileTypes) {
					if (url.endsWith(type)) message.args.push(url);
				}
				if (!message.args[0]) return message.channel.error('music/play:INVALID_FILE');
			} else {
				return message.channel.error('music/play:NO_INPUT');
			}
		}

		// Get search query
		let res;
		const search = message.args.join(' ');

		// Search for track
		try {
			res = await player.search(search, message.author);
			if (res.loadType === 'error') {
				if (!player.queue.current) player.destroy();
				throw res.exception;
			}
		} catch (err) {
			return message.channel.error('music/play:ERROR', { ERROR: err.message });
		}
		// Workout what to do with the results
		if (res.loadType == 'empty') {
			// An error occured or couldn't find the track
			if (!player.queue.current) player.destroy();
			return message.channel.error('music/play:NO_SONG');

		} else if (res.loadType == 'playlist') {
			// Connect to voice channel if not already
			if (player.state !== 'CONNECTED') player.connect();

			// Show how many songs have been added
			const embed = new Embed(bot, message.guild)
				.setColor(message.member.displayHexColor)
				.setDescription(message.translate('music/play:QUEUED', { NUM: res.playlist.tracks.length + 1 }));
			message.channel.send({ embeds: [embed] });

			// Add songs to queue and then pLay the song(s) if not already
			player.queue.add(res.playlist.tracks);
			if (!player.playing && !player.paused && player.queue.totalSize === (res.playlist.tracks.length + 1)) player.play();
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
				message.channel.send({ embeds: [embed] });
			}
		}
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId),
			member = guild.members.cache.get(interaction.user.id),
			flag = args.get('flag')?.value,
			search = args.get('track').value;

		// make sure user is in a voice channel
		if (!member.voice.channel) return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:MISSING_ROLE', null, true)] });

		// Check that user is in the same voice channel
		if (bot.manager?.players.get(guild.id)) {
			if (member.voice.channel.id != bot.manager?.players.get(guild.id).voiceChannel) return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:NOT_VOICE', null, true)] });
		}

		if (guild.roles.cache.get(guild.settings.MusicDJRole)) {
			if (!member.roles.cache.has(guild.settings.MusicDJRole)) {
				return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:MISSING_ROLE', null, true)] });
			}
		}

		await interaction.deferReply();

		// Create player
		let player, res;
		try {
			player = bot.manager.create({
				guild: guild.id,
				voiceChannel: member.voice.channel.id,
				textChannel: channel.id,
				selfDeafen: true,
			});
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.followUp({ ephemeral: true, embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}

		// Search for track
		try {
			res = await player.search(search, member);
			if (res.loadType === 'error') {
				if (!player.queue.current) player.destroy();
				throw res.exception;
			}
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.followUp({ ephemeral: true, embeds: [channel.error('music/play:ERROR', { ERROR: err.message }, true)] });
		}

		switch (res.loadType) {
			case 'empty':
				// An error occured or couldn't find the track
				if (!player.queue.current) player.destroy();
				return interaction.followUp({ ephemeral: true, embeds: [channel.error('music/play:NO_SONG', null, true)] });
			case 'playlist':
				// Connect to voice channel if not already
				if (player.state !== 'CONNECTED') player.connect();
				// Add songs to queue depending on flag (if any)
				switch (flag) {
					case '-r':
					// Reverse the added tracks
						player.queue.add(res.playlist.tracks.reverse());
						break;
					case '-n':
					// Add the tracks to the front of the queue
						player.queue.unshift(...res.playlist.tracks);
						break;
					case '-s':
					// Shuffle the added songs
						player.queue.add(res.playlist.tracks.sort(() => Math.random() - 0.5));
						break;
					default:
						player.queue.add(res.playlist.tracks);
				}

				if (!player.playing && !player.paused && player.queue.totalSize === (res.playlist.tracks.length + 1)) player.play();
				return interaction.followUp({ embeds: [new Embed(bot, guild)
					.setColor(member.displayHexColor)
					.setDescription(bot.translate('music/play:QUEUED', { NUM: res.playlist.tracks.length + 1 }))] });
			default:
				// add track to queue and play
				if (player.state !== 'CONNECTED') player.connect();
				// Add songs to queue depending on flag (if any)
				switch (flag) {
					case '-n':
					// Add the tracks to the front of the queue
						player.queue.unshift(res.tracks[0]);
						break;
					default:
						player.queue.add(res.tracks[0]);
				}

				if (!player.playing && !player.paused && player.queue.size == 0) {
					try {
						await player.play();
						return interaction.followUp({ embeds: [channel.success('music/play:QUEUE', {}, true)] });
					} catch (err) {
						bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
						return interaction.followUp({ ephemeral: true, embeds: [channel.error('music/play:ERROR', { ERROR: err.message }, true)] });
					}
				} else {
					const embed = new Embed(bot, guild)
						.setColor(member.displayHexColor)
						.setDescription(bot.translate('music/play:SONG_ADD', { TITLE: res.tracks[0].title, URL: res.tracks[0].uri }));
					return interaction.followUp({ embeds: [embed] });
				}
		}
	}

	async autocomplete(bot, interaction) {
		// Get current input and make sure it's not 0
		const searchQuery = interaction.options.getFocused(true).value;
		if (searchQuery.length == 0 || searchQuery.startsWith('http')) return interaction.respond([]);

		try {
			let fetched = false;
			const res = await axios.get(`https://www.youtube.com/results?q=${rfc3986EncodeURIComponent(searchQuery)}&hl=en`);
			let html = res.data;

			// try to parse html
			try {
				const data = html.split('ytInitialData = \'')[1]?.split('\';</script>')[0];
				html = data.replace(/\\x([0-9A-F]{2})/ig, (...items) => String.fromCharCode(parseInt(items[1], 16)));
				html = html.replaceAll('\\\\"', '');
				html = JSON.parse(html);
			} catch { null; }

			let videos;
			if (html?.contents?.sectionListRenderer?.contents?.length > 0 && html.contents.sectionListRenderer.contents[0]?.itemSectionRenderer?.contents?.length > 0) {
				videos = html.contents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
				fetched = true;
			}

			// backup/ alternative parsing
			if (!fetched) {
				try {
					videos = JSON.parse(html.split('{"itemSectionRenderer":{"contents":')[html.split('{"itemSectionRenderer":{"contents":').length - 1].split(',"continuations":[{')[0]);
					fetched = true;
				} catch {	fetched = false; }
			}
			if (!fetched) {
				try {
					videos = JSON.parse(html.split('{"itemSectionRenderer":')[html.split('{"itemSectionRenderer":').length - 1].split('},{"continuationItemRenderer":{')[0]).contents;
					fetched = true;
				} catch { fetched = false; }
			}

			const results = [];
			if (!fetched) return interaction.respond(results);
			for (const video of videos.filter(v => typeof v.videoRenderer !== 'undefined')) {
				// Only get 5 video suggestions
				if (results.length >= 5) break;
				results.push({
					title: video.videoRenderer.title.runs[0].text.substring(0, 100),
					url: `https://www.youtube.com${video.videoRenderer.navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
				});
			}
			// Send back the results to the user
			interaction.respond(results.map(video => ({ name: video.title, value: interaction.commandName == 'play' ? video.url : video.title })));
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			interaction.respond([]);
		}
	}
}

module.exports = Play;
