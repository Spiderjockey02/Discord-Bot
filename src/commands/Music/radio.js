// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	{ getStations } = require('radio-browser'),
	Command = require('../../structures/Command.js');

/**
 * radio command
 * @extends {Command}
*/
class Radio extends Command {
	/**
	   * @param {Client} client The instantiating client
	   * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'radio',
			guildOnly: true,
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.Connect, Flags.Speak],
			description: 'Listen to the radio',
			usage: 'radio <query>',
			cooldown: 3000,
			slash: true,
			options: [{
				name: 'station',
				description: 'Radio station name',
				type: ApplicationCommandOptionType.String,
				required: true,
				autocomplete: true,
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
		// Check if the member has role to interact with music plugin
		if (message.guild.roles.cache.get(settings.MusicDJRole)) {
			if (!message.member.roles.cache.has(settings.MusicDJRole)) {
				return message.channel.error('misc:MISSING_ROLE');
			}
		}

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

		// make sure a radio station was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('music/radio:USAGE')) });

		// Search for radio station
		let data;
		try {
			data = await getStations({
				limit: 10,
				order: 'topclick',
				hidebroken: true,
				countrycodeexact: settings.language,
				language: bot.languages.find((l) => l.name.includes(settings.Language))?.nativeName,
				by: 'name',
				searchterm: message.args.join(' '),
			});
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
		}

		if (!data?.[0]) return message.channel.send(message.translate('music/radio:MISSING_RADIO'));

		const results = data.map((track, index) => `${++index} - \`${track.name}\``).join('\n');
		let embed = new Embed(bot, message.guild)
			.setTitle(message.translate('music/radio:RESULTS_FOR', { USER: message.args.join(' ') }))
			.setColor(message.member.displayHexColor)
			.setDescription(message.translate('music/radio:NUMBER_PICK', { RESULTS: results }));
		message.channel.send({ embeds: [embed] });

		const filter = (m) => m.author.id === message.author.id && /^(\d+|cancel)$/i.test(m.content);
		const max = data.length;

		let collected;
		try {
			collected = await message.channel.awaitMessages({ filter, max: 1, time: 30e3, errors: ['time'] });
		} catch (e) {
			return message.reply(message.translate('music/misc:SONG_TIMED'));
		}

		const first = collected.first().content;

		if (first.toLowerCase() === 'cancel') {
			// Clean up an idle player that may have been left over
			const existing = bot.manager?.players.get(message.guild.id);
			if (existing && !existing.queue.current) existing.destroy();
			return message.channel.send(message.translate('misc:CANCELLED_SELECTION'));
		}

		const index = Number(first) - 1;
		if (index < 0 || index > max - 1) return message.reply(message.translate('music/radio:NAN', { MAX: max }));

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

		const res = await player.search(data[index].url_resolved || data[index].url, message.author);

		if (res.loadType == 'empty' || res.loadType == 'error') {
			// An error occured or couldn't find the track
			if (!player.queue.current) player.destroy();
			return message.channel.error('music/play:NO_SONG');
		} else {
			// add track to queue and play
			if (player.state !== 'CONNECTED') player.connect();
			const idle = !player.playing && !player.paused && !player.queue.current;
			player.queue.add(res.tracks[0]);
			if (idle) {
				player.play();
			} else {
				embed = new Embed(bot, message.guild)
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
	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId),
			input = args.get('station').value;

		// Check if the member has role to interact with music plugin
		if (guild.roles.cache.get(guild.settings.MusicDJRole)) {
			if (!member.roles.cache.has(guild.settings.MusicDJRole)) {
				return interaction.reply({ embeds: [channel.error('misc:MISSING_ROLE', {}, true)], ephemeral: true });
			}
		}

		// make sure user is in a voice channel
		if (!member.voice.channel) return interaction.reply({ embeds: [channel.error('music/play:NOT_VC', {}, true)], ephemeral: true });

		// Check that user is in the same voice channel
		if (bot.manager?.players.get(guild.id)) {
			if (member.voice.channel.id != bot.manager?.players.get(guild.id).voiceChannel) return interaction.reply({ embeds: [channel.error('misc:NOT_VOICE', {}, true)], ephemeral: true });
		}

		// Check if VC is full and bot can't join doesn't have (Flags.ManageChannels)
		if (member.voice.channel.full && !member.voice.channel.permissionsFor(guild.members.me).has(Flags.MoveMembers)) {
			return interaction.reply({ embeds: [channel.error('music/play:VC_FULL', {}, true)], ephemeral: true });
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
			return interaction.editReply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}

		// Search for track
		try {
			res = await player.search(input, member);
			if (res.loadType === 'error') {
				if (!player.queue.current) player.destroy();
				throw res.exception;
			}
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.editReply({ embeds: [channel.error('music/play:ERROR', { ERROR: err.message }, true)] });
		}

		// Workout what to do with the results
		if (res.loadType == 'empty') {
			// An error occured or couldn't find the track
			if (!player.queue.current) player.destroy();
			return interaction.editReply({ embeds: [channel.error('music/play:NO_SONG', { ERROR: null }, true)] });

		} else if (res.loadType == 'playlist') {
			// Connect to voice channel if not already
			if (player.state !== 'CONNECTED') player.connect();
			// Show how many songs have been added
			const embed = new Embed(bot, guild)
				.setColor(member.displayHexColor)
				.setDescription(guild.translate('music/play:QUEUED', { NUM: res.tracks.length }));

			// Add songs to queue and then play the song(s) if not already
			const idle = !player.playing && !player.paused && !player.queue.current;
			player.queue.add(res.tracks);
			if (idle) player.play();

			return interaction.editReply({ embeds: [embed] });
		} else {
			// add track to queue and play
			if (player.state !== 'CONNECTED') player.connect();
			const idle = !player.playing && !player.paused && !player.queue.current;
			player.queue.add(res.tracks[0]);
			if (idle) {
				player.play();
				return interaction.editReply({ embeds: [channel.success('music/play:QUEUE', {}, true)] });
			} else {
				const embed = new Embed(bot, guild)
					.setColor(member.displayHexColor)
					.setDescription(guild.translate('music/play:SONG_ADD', { TITLE: res.tracks[0].title, URL: res.tracks[0].uri }));
				return interaction.editReply({ embeds: [embed] });
			}
		}
	}

	/**
	 * Function for handling autocomplete
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @readonly
	*/
	async autocomplete(bot, interaction) {
		const input = interaction.options.getFocused(true).value,
			radios = await bot.fetch('info/radio', { search: input });

		// Send back the responses
		interaction.respond(radios.map(i => ({ name: i.name, value: i.audio })));
	}
}

module.exports = Radio;
