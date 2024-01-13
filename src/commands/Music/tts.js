// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * TTS command
 * @extends {Command}
*/
class TTS extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'tts',
			guildOnly: true,
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.Speak],
			description: 'Text-to-speech to a voice channel.',
			usage: 'tts <some text>',
			cooldown: 3000,
			examples: ['tts hello this is example'],
			slash: true,
			options: [{
				name: 'text',
				description: 'Text to read out',
				type: ApplicationCommandOptionType.String,
				required: true,
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

		// Search for track
		let res;
		try {
			res = await player.search({ source: 'speak', query: message.args.join(' ') }, message.author);
			if (res.loadType === 'error') {
				if (!player.queue.current) player.destroy();
				throw res.exception;
			}
		} catch (err) {
			return message.channel.error('music/play:ERROR', { ERROR: err.message });
		}

		// Make sure there was results
		if (res.loadType == 'empty') {
			// An error occured or couldn't find the track
			if (!player.queue.current) player.destroy();
			return message.channel.error('music/play:NO_SONG');
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
			text = args.get('text').value;

		// Check if the member has role to interact with music plugin
		if (guild.roles.cache.get(guild.settings.MusicDJRole)) {
			if (!member.roles.cache.has(guild.settings.MusicDJRole)) {
				return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:MISSING_ROLE', null, true)] });
			}
		}

		// make sure user is in a voice channel
		if (!member.voice.channel) return interaction.reply({ ephemeral: true, embeds: [channel.error('music/play:NOT_VC', null, true)] });

		// Check that user is in the same voice channel
		if (bot.manager?.players.get(guild.id)) {
			if (member.voice.channel.id != bot.manager?.players.get(guild.id).voiceChannel) return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:NOT_VOICE', null, true)] });
		}

		// Check if VC is full and bot can't join doesn't have (Flags.ManageChannels)
		if (member.voice.channel.full && !member.voice.channel.permissionsFor(guild.members.me).has(Flags.MoveMembers)) {
			return interaction.reply({ ephemeral: true, embeds: [channel.error('music/play:VC_FULL', null, true)] });
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
			return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}

		// Search for track
		let res;
		try {
			res = await player.search({ source: 'speak', query: text }, member.user);
			if (res.loadType === 'error') {
				if (!player.queue.current) player.destroy();
				throw res.exception;
			}
		} catch (err) {
			return interaction.reply({ ephemeral: true, embeds: [channel.error('music/play:ERROR', { ERROR: err.message }, true)] });
		}

		// Make sure there was results
		if (res.loadType == 'empty') {
			// An error occured or couldn't find the track
			if (!player.queue.current) player.destroy();
			return interaction.reply({ ephemeral: true, embeds: [channel.error('music/play:NO_SONG', null, true)] });
		} else {
			// add track to queue and play
			if (player.state !== 'CONNECTED') player.connect();
			player.queue.add(res.tracks[0]);
			if (!player.playing && !player.paused && !player.queue.size) {
				player.play();
			} else {
				const embed = new Embed(bot, guild)
					.setColor(member.displayHexColor)
					.setDescription(guild.translate('music/play:SONG_ADD', { TITLE: res.tracks[0].title, URL: res.tracks[0].uri }));
				interaction.reply({ embeds: [embed] });
			}
		}
	}
}

module.exports = TTS;
