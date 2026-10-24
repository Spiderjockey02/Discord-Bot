// Dependencies
const	{ Embed, time: { getReadableTime } } = require('../../utils'),
	{ PlaylistSchema } = require('../../database/models'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	AudioManager = require('../../base/Audio-Manager'),
	Command = require('../../structures/Command.js'),
	isUrl = (value) => /^https?:\/\//i.test(value.trim());

/**
 * playlist create command
 * @extends {Command}
*/
class PCreate extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'playlist-create',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['playlist-create'],
			description: 'Create a playlist',
			usage: 'p-create <playlist name> <search query/link>',
			cooldown: 3000,
			examples: ['p-create Songs https://www.youtube.com/watch?v=N3vY6yvHLdc&list=PLUhFQlEQDZOfDqu5eZUvwUs7EEcPpeVbB'],
			slash: false,
			isSubCmd: true,
			options: [
				{
					name: 'name',
					description: 'Name of new playlist',
					type: ApplicationCommandOptionType.String,
					maxLength: 32,
					required: true,
				},
				{
					name: 'track',
					description: 'The link or name of the track.',
					type: ApplicationCommandOptionType.String,
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
		if (!message.args[1]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('music/p-create:USAGE')) });
		if (message.args[0].length > 32) return message.channel.error('music/p-create:TOO_LONG');

		const msg = await message.channel.send({ content: message.translate('music/p-create:WAITING') }),
			playlistName = message.args[0],
			searchQuery = message.args.slice(1).join(' ');

		try {
			const playlists = await	PlaylistSchema.find({
				creator: message.author.id,
			});

			// response from database
			if (!playlists[0]) {
				const resp = await this.createPlaylist(bot, message.channel, message.author, playlistName, searchQuery);
				msg.edit({ content: null, embeds: [resp] });
			} else if (playlists[0] && !message.author.premium) {
				// User needs premium to save more playlists
				return msg.edit(message.translate('music/p-create:NO_PREM'));
			} else if (playlists.length >= 3 && message.author.premium) {
				// there is a max of 3 playlists per a user even with premium
				return msg.edit(message.translate('music/p-create:MAX_PLAYLISTS'));
			} else if (playlists && message.author.premium) {
				// user can have save another playlist as they have premium
				const exist = playlists.find(obj => obj.name == playlistName);
				if (!exist) {
					const resp = await this.createPlaylist(bot, message.channel, message.author, playlistName, searchQuery);
					msg.edit({ content: null, embeds: [resp] });
				} else {
					msg.edit(message.translate('music/p-create:EXISTS'));
				}
			}
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
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
			playlistName = args.get('name').value,
			searchQuery = args.get('track').value;

		// Searching (and possibly waiting for a pick) can take longer than 3 seconds
		await interaction.deferReply();

		try {
			const playlists = await	PlaylistSchema.find({
				creator: interaction.user.id,
			});

			// response from database
			if (!playlists[0]) {
				const resp = await this.createPlaylist(bot, channel, interaction.user, playlistName, searchQuery);
				await interaction.editReply({ embeds: [resp] });
			} else if (playlists[0] && !interaction.user.premium) {
				// User needs premium to save more playlists
				await interaction.editReply({ embeds: [channel.error('music/p-create:NO_PREM', null, true)] });
			} else if (playlists.length >= 3 && interaction.user.premium) {
				// there is a max of 3 playlists per a user even with premium
				await interaction.editReply({ embeds: [channel.error('music/p-create:MAX_PLAYLISTS', null, true)] });
			} else if (playlists && interaction.user.premium) {
				// user can have save another playlist as they have premium
				const exist = playlists.find(obj => obj.name == playlistName);
				if (!exist) {
					const resp = await this.createPlaylist(bot, channel, interaction.user, playlistName, searchQuery);
					await interaction.editReply({ embeds: [resp] });
				} else {
					await interaction.editReply({ embeds: [channel.error('music/p-create:EXISTS', null, true)] });
				}
			}
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			await interaction.editReply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}

	/**
	 * Function for creating the playlist
	 * @param {bot} bot The instantiating client
	 * @param {channel} channel The interaction that ran the command
	 * @param {User} user The guild the interaction ran in
	 * @param {string} playlistName The name of the playlist
	 * @param {string} searchQuery The seqrch query for new track
	 * @return {embed}
	*/
	async createPlaylist(bot, channel, user, playlistName, searchQuery) {
		// Get songs to add to playlist
		let res;
		try {
			res = await bot.manager.search(searchQuery, user);
			if (res.loadType === 'error') throw res.exception;
		} catch (err) {
			return channel.error('music/play:ERROR', { ERROR: err?.message ?? err }, true);
		}

		switch (res.loadType) {
			case 'empty':
				// An error occured or couldn't find the track
				return channel.error('music/play:NO_SONG', null, true);
			case 'playlist':
				return await this.savePlaylist(bot, channel, user, playlistName, res.playlist.tracks.slice(0, user.premium ? 200 : 100));
			case 'search': {
				// A link resolves straight to its track, only a plain text search needs the user to pick a result
				if (isUrl(searchQuery)) return await this.savePlaylist(bot, channel, user, playlistName, [res.tracks[0]]);

				// Display the options for search
				let max = 10, collected;
				const filter = (m) => m.author.id === user.id && /^(\d+|cancel)$/i.test(m.content);
				if (res.tracks.length < max) max = res.tracks.length;

				const results = res.tracks.slice(0, max).map((track, index) => `${++index} - \`${track.title}\``).join('\n');
				const embed = new Embed(bot, channel.guild)
					.setTitle('music/search:TITLE', { TITLE: searchQuery })
					.setDescription(channel.guild.translate('music/search:DESC', { RESULTS: results }));
				const search = await channel.send({ embeds: [embed] });

				try {
					collected = await channel.awaitMessages({ filter, max: 1, time: 30e3, errors: ['time'] });
				} catch (e) {
					return channel.error('misc:WAITED_TOO_LONG', null, true);
				}

				const first = collected.first().content;
				if (first.toLowerCase() === 'cancel') return channel.success('misc:CANCELLED', null, true);

				const index = Number(first) - 1;
				if (index < 0 || index > max - 1) return channel.error('music/search:INVALID', { NUM: max }, true);

				search.delete().catch(() => null);
				return await this.savePlaylist(bot, channel, user, playlistName, [res.tracks[index]]);
			}
			default:
				return channel.error('music/p-create:NO_SONG', null, true);
		}
	}

	/**
	 * Function for saving the new playlist to the database
	 * @param {bot} bot The instantiating client
	 * @param {channel} channel The interaction that ran the command
	 * @param {User} user The guild the interaction ran in
	 * @param {string} playlistName The name of the playlist
	 * @param {array<objects>} tracks The tracks to save in the playlist
	 * @return {embed}
	*/
	async savePlaylist(bot, channel, user, playlistName, tracks) {
		try {
			// Save playlist to database
			const duration = tracks.reduce((total, track) => total + (track.duration || 0), 0);
			const newPlaylist = new PlaylistSchema({
				name: playlistName,
				songs: tracks.map(track => AudioManager.serializeTrack(track)),
				timeCreated: Date.now(),
				thumbnail: tracks[0]?.thumbnail ?? null,
				creator: user.id,
				duration,
			});
			await newPlaylist.save();

			// Show that playlist has been saved
			const embed = new Embed(bot, channel.guild)
				.setAuthor({ name: newPlaylist.name, iconURL: user.displayAvatarURL() })
				.setDescription([
					channel.guild.translate('music/p-create:DESC_1', { TITLE: playlistName }),
					channel.guild.translate('music/p-create:DESC_2', { NUM: duration ? getReadableTime(duration) : '0sec' }),
					channel.guild.translate('music/p-create:DESC_3', { NAME: tracks[0].title, NUM: tracks.length, TITLE: playlistName }),
				].join('\n'))
				.setFooter({ text: channel.guild.translate('music/p-create:FOOTER', { ID: newPlaylist._id, NUM: newPlaylist.songs.length, PREM: (user.premium) ? '200' : '100' }) })
				.setTimestamp();
			return embed;
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err}.`);
			return channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true);
		}
	}
}

module.exports = PCreate;
