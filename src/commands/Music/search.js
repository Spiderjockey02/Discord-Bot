// Dependencies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

/**
 * search command
 * @extends {Command}
*/
class Search extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'search',
			guildOnly: true,
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CONNECT', 'SPEAK'],
			description: 'Searches for a song.',
			usage: 'search <link / song name>',
			cooldown: 3000,
			examples: ['search palaye royale'],
			slash: true,
			options: [{
				name: 'track',
				description: 'track to search for.',
				type: 'STRING',
				required: true,
				autocomplete: true,
			}],
		});
	}

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(bot, message, settings) {
		// Check if the member has role to interact with music plugin
		if (message.guild.roles.cache.get(settings.MusicDJRole)) {
			if (!message.member.roles.cache.has(settings.MusicDJRole)) {
				return message.channel.error('misc:MISSING_ROLE').then(m => m.timedDelete({ timeout: 10000 }));
			}
		}

		// make sure user is in a voice channel
		if (!message.member.voice.channel) return message.channel.error('music/play:NOT_VC').then(m => m.timedDelete({ timeout: 10000 }));

		// Check that user is in the same voice channel
		if (bot.manager?.players.get(message.guild.id)) {
			if (message.member.voice.channel.id != bot.manager?.players.get(message.guild.id).voiceChannel) return message.channel.error('misc:NOT_VOICE').then(m => m.timedDelete({ timeout: 10000 }));
		}

		// Check if VC is full and bot can't join doesn't have (MANAGE_CHANNELS)
		if (message.member.voice.channel.full && !message.member.voice.channel.permissionsFor(message.guild.me).has('MOVE_MEMBERS')) {
			return message.channel.error('music/play:VC_FULL').then(m => m.timedDelete({ timeout: 10000 }));
		}

		// Make sure that a song/url has been entered
		if (!message.args) return message.channel.error('music/search:NO_INPUT');

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
			return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}

		const search = message.args.join(' ');
		let res;

		// Search for track
		try {
			res = await player.search(search, message.author);
			if (res.loadType === 'LOAD_FAILED') {
				if (!player.queue.current) player.destroy();
				throw res.exception;
			}
		} catch (err) {
			return message.channel.error('music/search:ERROR', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}

		// Workout what to do with the results
		if (res.loadType == 'NO_MATCHES') {
			// An error occured or couldn't find the track
			if (!player.queue.current) player.destroy();
			return message.channel.error('music/search:NO_SONG');
		} else {
			// Display the options for search
			let max = 10, collected;
			const filter = (m) => m.author.id === message.author.id && /^(\d+|cancel)$/i.test(m.content);
			if (res.tracks.length < max) max = res.tracks.length;

			const results = res.tracks.slice(0, max).map((track, index) => `${++index} - \`${track.title}\``).join('\n');
			const embed = new Embed(bot, message.guild)
				.setTitle('music/search:TITLE', { TITLE: message.args.join(' ') })
				.setColor(message.member.displayHexColor)
				.setDescription(message.translate('music/search:DESC', { RESULTS: results }));
			message.channel.send({ embeds: [embed] });

			try {
				collected = await message.channel.awaitMessages({ filter, max: 1, time: 30e3, errors: ['time'] });
			} catch (e) {
				if (!player.queue.current) player.destroy();
				return message.reply(message.translate('misc:WAITED_TOO_LONG'));
			}

			const first = collected.first().content;
			if (first.toLowerCase() === 'cancel') {
				if (!player.queue.current) player.destroy();
				return message.channel.send(message.translate('misc:CANCELLED'));
			}

			const index = Number(first) - 1;
			if (index < 0 || index > max - 1) return message.reply(message.translate('music/search:INVALID', { NUM: max }));

			const track = res.tracks[index];
			if (player.state !== 'CONNECTED') player.connect();
			player.queue.add(track);

			if (!player.playing && !player.paused && !player.queue.size) {
				player.play();
			} else {
				message.channel.send(message.translate('music/search:ADDED', { TITLE: track.title }));
			}
		}
	}

	/**
 * Function for recieving interaction.
 * @param {bot} bot The instantiating client
 * @param {interaction} interaction The interaction that ran the command
 * @param {guild} guild The guild the interaction ran in
 * @param {args} args The options provided in the command, if any
 * @readonly
*/
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId),
			member = guild.members.cache.get(interaction.user.id),
			search = args.get('track').value;

		// Check if the member has role to interact with music plugin
		if (guild.roles.cache.get(guild.settings.MusicDJRole)) {
			if (!member.roles.cache.has(guild.settings.MusicDJRole)) {
				return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:MISSING_ROLE', { }, true)] });
			}
		}

		// make sure user is in a voice channel
		if (!member.voice.channel) return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:MISSING_ROLE', { }, true)] });

		// Check that user is in the same voice channel
		if (bot.manager?.players.get(guild.id)) {
			if (member.voice.channel.id != bot.manager?.players.get(guild.id).voiceChannel) return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:NOT_VOICE', { }, true)] });
		}

		// Check if VC is full and bot can't join doesn't have (MANAGE_CHANNELS)
		if (member.voice.channel.full && !member.voice.channel.permissionsFor(guild.me).has('MOVE_MEMBERS')) {
			return interaction.reply({ ephemeral: true, embeds: [channel.error('music/play:VC_FULL', { }, true)] });
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
			console.log(err);
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}

		// Search for track
		let res;
		try {
			res = await player.search(search, member.user);
			if (res.loadType === 'LOAD_FAILED') {
				if (!player.queue.current) player.destroy();
				throw res.exception;
			}
		} catch (err) {
			return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}

		// Workout what to do with the results
		if (res.loadType == 'NO_MATCHES') {
			// An error occured or couldn't find the track
			if (!player.queue.current) player.destroy();
			return interaction.reply({ embeds: [channel.error('music/search:NO_SONG', {}, true)] });
		} else {
			// Display the options for search
			let max = 10, collected;
			const filter = (m) => m.author.id === member.user.id && /^(\d+|cancel)$/i.test(m.content);
			if (res.tracks.length < max) max = res.tracks.length;

			const results = res.tracks.slice(0, max).map((track, index) => `${++index} - \`${track.title}\``).join('\n');
			const embed = new Embed(bot, guild)
				.setTitle('music/search:TITLE', { TITLE: search })
				.setColor(member.displayHexColor)
				.setDescription(guild.translate('music/search:DESC', { RESULTS: results }));
			interaction.reply({ embeds: [embed] });

			try {
				collected = await channel.awaitMessages(filter, { max: 1, time: 30e3, errors: ['time'] });
			} catch (e) {
				if (!player.queue.current) player.destroy();
				return interaction.reply({ content:guild.translate('misc:WAITED_TOO_LONG') });
			}
			const first = collected.first().content;
			if (first.toLowerCase() === 'cancel') {
				if (!player.queue.current) player.destroy();
				return interaction.reply({ content:guild.translate('misc:CANCELLED') });
			}

			const index = Number(first) - 1;
			if (index < 0 || index > max - 1) return interaction.reply({ content:guild.translate('music/search:INVALID', { NUM: max }) });

			const track = res.tracks[index];
			if (player.state !== 'CONNECTED') player.connect();
			player.queue.add(track);

			if (!player.playing && !player.paused && !player.queue.size) {
				player.play();
			} else {
				interaction.reply({ content:guild.translate('music/search:ADDED', { TITLE: track.title }) });
			}
		}
	}
}

module.exports = Search;
