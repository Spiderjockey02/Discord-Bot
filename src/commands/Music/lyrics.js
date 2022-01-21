// Dependencies
const { Embed } = require('../../utils'),
	{ getSong } = require('genius-lyrics-api'),
	{ paginate } = require('../../utils'),
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
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Get lyrics on a song.',
			usage: 'lyrics [song]',
			cooldown: 3000,
			slash: true,
			options: [{
				name: 'track',
				description: 'The link or name of the track.',
				type: 'STRING',
				required: false,
			}],
		});
	}

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(bot, message) {
		// Check that a song is being played
		let options;
		if (message.args.length == 0) {
			// Check if a song is playing and use that song
			const player = bot.manager?.players.get(message.guild.id);
			if (!player) return message.channel.error('misc:NO_QUEUE').then(m => m.timedDelete({ timeout: 10000 }));
			options = {
				apiKey: bot.config.api_keys.genuis,
				title: player.queue.current.title,
				artist: '‎',
				optimizeQuery: true,
			};
		} else {
			// Use the message.args for song search
			options = {
				apiKey: bot.config.api_keys.genuis,
				title: message.args.join(' '),
				artist: '‎',
				optimizeQuery: true,
			};
		}

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// display lyrics
		try {
			const lyrics = await this.searchLyrics(bot, message.guild, options, message.author);
			msg.delete();
			if (Array.isArray(lyrics)) {
				paginate(bot, message.channel, lyrics);
			} else {
				message.channel.send({ content: lyrics });
			}
		} catch (err) {
			msg.delete();
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message ?? err }).then(m => m.timedDelete({ timeout: 5000 }));
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
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId),
			song = args.get('track')?.value;

		// create options
		let options;
		if (!song) {
			// Check if a song is playing and use that song
			const player = bot.manager?.players.get(guild.id);
			if (!player) return interaction.reply({ embeds: [channel.error('misc:NO_QUEUE', {}, true)] });
			options = {
				apiKey: bot.config.api_keys.genuis,
				title: player.queue.current.title,
				artist: '‎',
				optimizeQuery: true,
			};
		} else {
			// Use the message.args for song search
			options = {
				apiKey: bot.config.api_keys.genuis,
				title: song,
				artist: '‎',
				optimizeQuery: true,
			};
		}

		// display lyrics
		try {
			const lyrics = await this.searchLyrics(bot, guild, options, member.user);
			if (Array.isArray(lyrics)) {
				paginate(bot, channel, lyrics);
			} else {
				interaction.reply({ content: lyrics });
			}
		} catch (err) {
			interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message ?? err }, true)], ephemeral: true });
		}
	}

	async searchLyrics(bot, guild, options, author) {
		// search for and send lyrics
		const info = await getSong(options);

		// make sure lyrics were found
		if (!info || !info.lyrics) {
			return guild.translate('music/lyrics:NO_LYRICS');
		}

		// create pages
		let pagesNum = Math.ceil(info.lyrics.length / 2048);
		if (pagesNum === 0) pagesNum = 1;

		const pages = [];
		for (let i = 0; i < pagesNum; i++) {
			const embed = new Embed(bot, guild)
				.setTitle(options.title)
				.setURL(info.url)
				.setDescription(info.lyrics.substring(i * 2048, (i + 1) * 2048))
				.setTimestamp()
				.setFooter({ text: guild.translate('music/lyrics:FOOTER', { TAG: author.tag }), iconURL: author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
			pages.push(embed);
		}

		// show paginator
		return pages;
	}
}

module.exports = Lyrics;
