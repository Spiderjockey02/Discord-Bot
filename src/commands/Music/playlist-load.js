// Dependencies
const	{ Embed } = require('../../utils'),
	{ PlaylistSchema } = require('../../database/models'),
	{ TrackUtils } = require('erela.js'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * playlist load command
 * @extends {Command}
*/
class PLoad extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'playlist-load',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['playlist-load'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.Connect, Flags.Speak],
			description: 'Load a playlist',
			usage: 'p-load <playlist name>',
			cooldown: 3000,
			examples: ['p-load Songs'],
			slash: false,
			isSubCmd: true,
			options: [
				{
					name: 'name',
					description: 'The name of the playlist',
					type: ApplicationCommandOptionType.String,
					autocomplete: true,
					required: true,
				},
			],
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(bot, message, settings) {
		// make sure a playlist name was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('music/p-load:USAGE')) });

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

		// send waiting message
		// const msg = await message.channel.send('Loading playlist (This might take a few seconds)...');

		const resp = await this.loadPlaylist(bot, message.channel, message.member, message.args[0]);
		message.channel.send({ embeds: [resp] });
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
			playlistName = args.get('name').value;

		// Check if the member has role to interact with music plugin
		if (guild.roles.cache.get(guild.settings.MusicDJRole) && !member.roles.cache.has(guild.settings.MusicDJRole)) {
			return interaction.reply({ embeds: [channel.error('misc:MISSING_ROLE', null, true)] });
		}

		// make sure user is in a voice channel
		if (!member.voice.channel) return interaction.reply({ embeds: [channel.error('music/play:NOT_VC', null, true)] });

		// Check that user is in the same voice channel
		if (bot.manager?.players.get(guild.id)) {
			if (member.voice.channel.id != bot.manager?.players.get(guild.id).voiceChannel) return interaction.reply({ embeds: [channel.error('misc:NOT_VOICE', null, true)] });
		}

		// Check if VC is full and bot can't join doesn't have (Flags.ManageChannels)
		if (member.voice.channel.full && !member.voice.channel.permissionsFor(guild.members.me).has(Flags.MoveMembers)) {
			return interaction.reply({ embeds: [channel.error('music/play:VC_FULL', null, true)] });
		}

		const resp = await this.loadPlaylist(bot, channel, member, playlistName);
		interaction.reply({ embeds: [resp] });
	}

	/**
	 * Function for saving the playlist
	 * @param {bot} bot The instantiating client
	 * @param {channel} channel The interaction that ran the command
	 * @param {member} member The guild the interaction ran in
	 * @param {string} playlistName The options provided in the command, if any
	 * @readonly
	*/
	async loadPlaylist(bot, channel, member, playlistName) {
		try {
			// interact with database
			const playlist = PlaylistSchema.findOne({
				name: playlistName,
				creator: member.user.id,
			});

			if (!playlist) return channel.error('music/p-load:NO_PLAYLIST', null, true);

			// Create player
			let player;
			try {
				player = bot.manager.create({
					guild: channel.guild.id,
					voiceChannel: member.voice.channel.id,
					textChannel: channel.id,
					selfDeafen: true,
				});
				player.connect();
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true);
			}

			// add songs to queue
			// eslint-disable-next-line no-async-promise-executor
			await new Promise(async function(resolve) {
				for (let i = 0; i < playlist.songs.length; i++) {
					player.queue.add(TrackUtils.buildUnresolved({
						title: playlist.songs[i].title,
						author: playlist.songs[i].author,
						duration: playlist.songs[i].duration,
					}, member.user));
					if (!player.playing && !player.paused && !player.queue.length) player.play();
					if (i == playlist.songs.length - 1) resolve();
				}
			});

			const embed = new Embed(bot, channel.guild)
				.setDescription(channel.guild.translate('music/p-load:QUEUE', { NUM: playlist.songs.length, TITLE: playlistName }));
			return embed;
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err}.`);
			return channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true);
		}
	}
}

module.exports = PLoad;
