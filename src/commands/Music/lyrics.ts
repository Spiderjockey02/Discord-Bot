// Dependencies
const { Embed, paginate } = require('../../utils'),
	{ ApplicationCommandOptionType } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * Lyrics command
 * @extends {Command}
*/
export default class Lyrics extends Command {
	/**
	   * @param {Client} client The instantiating client
	   * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
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
	 * @param {client} client The instantiating client
	 * @param {message} message The message that ran the command
	 * @readonly
		*/
	async run(client, message) {
		// Check that a song is being played
		let song = message.args.join(' ');

		// Check if they want to get the lyrics from the currently played song
		if (song.length == 0) {
			// Check if a song is playing and use that song
			const player = client.manager?.players.get(message.guild.id);
			if (!player) return message.channel.error('music/misc:NO_QUEUE');
			song = player.queue.current.title;
		}

		// send 'waiting' message to show client has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? client.customEmojis['loading'] : '', ITEM: this.help.name,
		}));

		// display lyrics
		try {
			const lyrics = await this.searchLyrics(client, message.guild, song, message.author);
			msg.delete();
			if (Array.isArray(lyrics)) {
				paginate(client, message.channel, lyrics, message.author.id);
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
	 * @param {client} client The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
	 * @readonly
	*/
	async callback(client, interaction, guild, args) {
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId);
		let song = args.get('track')?.value;

		await interaction.deferReply();

		// Check if they want to get the lyrics from the currently played song
		if (!song) {
			// Check if a song is playing and use that song
			const player = client.manager?.players.get(guild.id);
			if (!player) return interaction.followUp({ embeds: [channel.error('music/misc:NO_QUEUE', {}, true)] });
			song = player.queue.current.title;
		}

		// display lyrics
		try {
			const lyrics = await this.searchLyrics(client, guild, song, member.user);
			if (Array.isArray(lyrics)) {
				paginate(client, interaction, lyrics, member.id);
			} else {
				interaction.followUp({ content: lyrics });
			}
		} catch (err) {
			interaction.followUp({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message ?? err }, true)], ephemeral: true });
		}
	}

	async searchLyrics(client, guild, song, author) {
		// search for and send lyrics
		const info = await client.fetch('info/lyrics', { title: song });

		// make sure lyrics were found
		if (!info || !info.lyrics) return guild.translate('music/lyrics:NO_LYRICS');

		// create pages
		let pagesNum = Math.ceil(info.lyrics.join('\n').length / 2048);
		if (pagesNum === 0) pagesNum = 1;

		const pages = [];
		for (let i = 0; i < pagesNum; i++) {
			const embed = new Embed(client, guild)
				.setTitle(info.name)
				.setURL(info.url)
				.setDescription(info.lyrics.join('\n').substring(i * 2048, (i + 1) * 2048))
				.setTimestamp()
				.setFooter({ text: guild.translate('music/lyrics:FOOTER', { TAG: author.displayName }), iconURL: author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
			pages.push(embed);
		}

		// show paginator
		return pages;
	}
}

