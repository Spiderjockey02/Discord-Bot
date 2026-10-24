// Dependencies
const { Embed, paginate } = require('../../utils'),
	{ ApplicationCommandOptionType } = require('discord.js'),
	fetchLyrics = require('../../base/music/Lyrics'),
	Command = require('../../structures/Command.js');

/**
 * Lyrics command
 * @extends {Command}
*/
class Lyrics extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'lyrics',
			guildOnly: true,
			dirname: __dirname,
			description: 'Get lyrics on a song.',
			usage: 'lyrics [song]',
			cooldown: 3000,
			slash: true,
			options: [{
				name: 'track',
				description: 'The link or name of the track.',
				type: ApplicationCommandOptionType.String,
				required: false,
			}],
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(bot, message) {
		// Check that a song is being played
		let song = { title: message.args.join(' ') };

		// Check if they want to get the lyrics from the currently played song
		if (!song.title) {
			// Check if a song is playing and use that song
			const player = bot.manager?.players.get(message.guild.id);
			if (!player?.queue.current) return message.channel.error('misc:NO_QUEUE');
			song = player.queue.current;
		}

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// display lyrics
		try {
			const lyrics = await this.searchLyrics(bot, message.guild, song, message.author);
			msg.delete();
			if (Array.isArray(lyrics)) {
				paginate(bot, message.channel, lyrics, message.author.id);
			} else {
				message.channel.send({ content: lyrics });
			}
		} catch (err) {
			msg.delete();
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message ?? err });
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
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId);
		let song = { title: args.get('track')?.value };

		await interaction.deferReply();

		// Check if they want to get the lyrics from the currently played song
		if (!song.title) {
			// Check if a song is playing and use that song
			const player = bot.manager?.players.get(guild.id);
			if (!player?.queue.current) return interaction.followUp({ embeds: [channel.error('misc:NO_QUEUE', {}, true)] });
			song = player.queue.current;
		}

		// display lyrics
		try {
			const lyrics = await this.searchLyrics(bot, guild, song, member.user);
			if (Array.isArray(lyrics)) {
				paginate(bot, interaction, lyrics, member.id);
			} else {
				interaction.followUp({ content: lyrics });
			}
		} catch (err) {
			interaction.followUp({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message ?? err }, true)], ephemeral: true });
		}
	}

	async searchLyrics(bot, guild, song, author) {
		// search for and send lyrics (Tidal for Tidal tracks, then LRCLIB, then the Egglord API)
		const info = await fetchLyrics(bot, song);

		// make sure lyrics were found
		if (!info) return guild.translate('music/lyrics:NO_LYRICS');

		// create pages
		const pagesNum = Math.max(1, Math.ceil(info.lyrics.length / 2048));

		const pages = [];
		for (let i = 0; i < pagesNum; i++) {
			const embed = new Embed(bot, guild)
				.setTitle([info.artist, info.title].filter(Boolean).join(' - ').slice(0, 256))
				.setURL(info.url || null)
				.setDescription(info.lyrics.substring(i * 2048, (i + 1) * 2048))
				.setTimestamp()
				.setFooter({ text: guild.translate('music/lyrics:FOOTER', { TAG: author.displayName }), iconURL: author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
			pages.push(embed);
		}

		// show paginator
		return pages;
	}
}

module.exports = Lyrics;
