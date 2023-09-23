// Dependencies
const	{ Embed, time: { getReadableTime }, paginate } = require('../../utils'),
	{ PlaylistSchema } = require('../../database/models'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * playlist view command
 * @extends {Command}
*/
class PView extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'playlist-view',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['playlist-view'],
			description: 'View a playlist',
			usage: 'p-view <playlist name>',
			cooldown: 3000,
			examples: ['p-view Songs'],
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
	async run(bot, message) {
		// Find all playlists made by the user
		let playlists;
		try {
			playlists = await PlaylistSchema.find({
				creator: message.author.id,
			});
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
		}

		if (!playlists[0]) {
			message.channel.error('music/p-view:NO_PLAYLIST');
		} else {
			// Get all playlists name
			const playlistNames = playlists.map(pl => pl.name);

			// no playlist name was entered
			if (!message.args[0]) return message.channel.send(message.translate('music/p-view:AVAIABLE', { NAMES: playlistNames.join('`, `') }));

			// A valid playlist name was entered
			if (playlistNames.includes(message.args[0])) {
				const playlist = playlists.find(obj => obj.name == message.args[0]);

				// Show information on that playlist
				let pagesNum = Math.ceil(playlist.songs.length / 10);
				if (pagesNum === 0) pagesNum = 1;

				// Get total playlist duration
				const totalQueueDuration = playlist.songs.reduce((a, b) => a + b.duration, 0);

				const pages = [];
				let n = 1;
				for (let i = 0; i < pagesNum; i++) {
					const str = `${playlist.songs.slice(i * 10, i * 10 + 10).map(song => `**${n++}.** ${song.title} \`[${getReadableTime(song.duration)}]\``).join('\n')}`;
					const embed = new Embed(bot, message.guild)
						.setAuthor({ name: message.author.displayName, iconURL: message.author.displayAvatarURL() })
						.setThumbnail(playlist.thumbnail)
						.setTitle(playlist.name)
						.setDescription(str)
						.setTimestamp()
						.setFooter({ text: `Page ${i + 1}/${pagesNum} | ${playlist.songs.length} songs | ${getReadableTime(totalQueueDuration)} total duration` });
					pages.push(embed);
					if (i == pagesNum - 1 && pagesNum > 1) paginate(bot, message.channel, pages, message.author.id);
					else if (pagesNum == 1) message.channel.send({ embeds: [embed] });
				}
			} else {
				message.channel.error('music/p-view:NO_PLAYLIST');
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
		const channel = guild.channels.cache.get(interaction.channelId),
			playlistName = args.get('name')?.value;

		// Find all playlists made by the user
		let playlists;
		try {
			playlists = await PlaylistSchema.find({
				creator: interaction.user.id,
			});
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}

		if (!playlists[0]) {
			interaction.reply({ embeds: [channel.error('music/p-view:NO_PLAYLIST', null, true)] });
		} else {
			// Get all playlists name
			const playlistNames = playlists.map(pl => pl.name);

			// A valid playlist name was entered
			if (playlistNames.includes(playlistName)) {
				const playlist = playlists.find(obj => obj.name == playlistName);

				// Show information on that playlist
				let pagesNum = Math.ceil(playlist.songs.length / 10);
				if (pagesNum === 0) pagesNum = 1;

				// Get total playlist duration
				const totalQueueDuration = playlist.songs.reduce((a, b) => a + b.duration, 0);
				const pages = [];
				let n = 1;
				for (let i = 0; i < pagesNum; i++) {
					const str = `${playlist.songs.slice(i * 10, i * 10 + 10).map(song => `**${n++}.** ${song.title} \`[${getReadableTime(song.duration)}]\``).join('\n')}`;
					const embed = new Embed(bot, guild)
						.setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
						.setThumbnail(playlist.thumbnail)
						.setTitle(playlist.name)
						.setDescription(str)
						.setTimestamp(playlist.timeCreated)
						.setFooter({ text: `Page ${i + 1}/${pagesNum} | ${playlist.songs.length} songs | ${getReadableTime(totalQueueDuration)} total duration` });
					pages.push(embed);
					if (i == pagesNum - 1 && pagesNum > 1) paginate(bot, interaction, pages, interaction.user.id);
					else if (pagesNum == 1) interaction.reply({ embeds: [embed] });
				}
			} else {
				interaction.reply({ embeds:[channel.error('music/p-view:NO_PLAYLIST', null, true)] });
			}
		}
	}
}

module.exports = PView;
