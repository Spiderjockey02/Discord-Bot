// Dependencies
const { PlaylistSchema } = require('../../database/models'),
	{ Embed } = require('../../utils'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * playlist add command
 * @extends {Command}
*/
class PAdd extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'playlist-add',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['playlist-add'],
			description: 'Add a song to the playlist',
			usage: 'p-add <playlist name> <song>',
			cooldown: 3000,
			examples: ['p-add Songs https://www.youtube.com/watch?v=4AnmemzByVY'],
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
		// make sure something was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('music/p-add:USAGE')) });

		const resp = await this.addToPlaylist(bot, message.channel, message.author, message.args[0], message.args.slice(1).join(' '));
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
			playlistName = args.get('name').value,
			searchQuery = args.get('track').value;

		// Fetch playlist
		const resp = await this.addToPlaylist(bot, channel, interaction.user, playlistName, searchQuery);
		interaction.reply({ embeds: [resp] });
	}

	/**
	 * Function for editing the playlist
	 * @param {bot} bot The instantiating client
	 * @param {channel} channel The interaction that ran the command
	 * @param {User} user The guild the interaction ran in
	 * @param {string} playlistName The name of the playlist
	 * @param {string} searchQuery The seqrch query for new track
	 * @return {embed}
	*/
	async addToPlaylist(bot, channel, user, playlistName, searchQuery) {
		let playlist;
		try {
			playlist = await PlaylistSchema.findOne({
				name: playlistName,
				creator: user.id,
			});
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true);
		}

		// Playlist not found
		if (!playlist) return channel.error('music/p-add:NO_PLAYLIST', { NAME: playlistName }, true);

		// Get songs to add to playlist
		let res;
		try {
			res = await bot.manager.search(searchQuery, user);
		} catch (err) {
			return channel.error('music/p-add:ERROR', { ERROR: err.message }, true);
		}

		switch (res.loadType) {
			case 'NO_MATCHES':
				// An error occured or couldn't find the track
				return channel.error('music/play:NO_SONG', null, true);
			case 'PLAYLIST_LOADED':
			case 'TRACK_LOADED':
				try {
					// add songs to playlist
					const newTracks = res.tracks.slice(0, (user.premium ? 200 : 100) - playlist.songs.length);
					playlist.songs.push(...newTracks);
					playlist.duration = parseInt(playlist.duration) + parseInt(res.tracks.reduce((prev, curr) => prev + curr.duration, 0));
					await playlist.save();
					return channel.success('music/p-add:SUCCESS', { NUM: newTracks.length, TITLE: playlistName }, true);
				} catch (err) {
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					return channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true);
				}
			case 'SEARCH_RESULT': {
				// Display the options for search
				let max = 10, collected;
				const filter = (m) => m.author.id === user.id && /^(\d+|cancel)$/i.test(m.content);
				if (res.tracks.length < max) max = res.tracks.length;

				const results = res.tracks.slice(0, max).map((track, index) => `${++index} - \`${track.title}\``).join('\n');
				const embed = new Embed(bot, channel.guild)
					.setTitle('music/search:TITLE', { TITLE: playlistName })
					.setDescription(channel.guild.translate('music/search:DESC', { RESULTS: results }));
				channel.send({ embeds: [embed] });

				try {
					collected = await channel.awaitMessages({ filter, max: 1, time: 30e3, errors: ['time'] });
				} catch (e) {
					return channel.error('misc:WAITED_TOO_LONG', null, true);
				}

				const first = collected.first().content;
				if (first.toLowerCase() === 'cancel') return channel.success('misc:CANCELLED', null, true);

				const index = Number(first) - 1;
				if (index < 0 || index > max - 1) return channel.error('music/search:INVALID', { NUM: max }, true);

				const track = res.tracks[index];
				playlist.songs.push(track);
				playlist.duration = parseInt(playlist.duration) + parseInt(track.duration);
				await playlist.save();
				return channel.success('music/p-add:SUCCESS', { NUM: 1, TITLE: track.title }, true);
			}
			default:
				return channel.error('music/p-add:NO_SONG', null, true);
		}
	}
}

module.exports = PAdd;
