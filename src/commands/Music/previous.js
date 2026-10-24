// Dependencies
const { paginate } = require('../../utils'),
	{ Embed } = require('../../utils'),
	{ time: { getReadableTime } } = require('../../utils'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * previous command
 * @extends {Command}
*/
class Previous extends Command {
	/**
	 * @param {Client} client The instantiating client
	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'previous',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['played'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.Speak, Flags.AddReactions],
			description: 'Displays the previous tracks that have been played.',
			usage: 'previous [pageNumber]',
			cooldown: 3000,
			examples: ['previous', 'previous 2'],
			slash: true,
			options: [{
				name: 'page',
				description: 'The page number.',
				type: ApplicationCommandOptionType.Integer,
				required: false,
			}],
		});
	}

	/**
	 * Function for receiving message.
	 * @param {bot} bot The instantiating client
	 * @param {message} message The message that ran the command
	 * @param {settings} settings The settings of the channel the command ran in
	 * @readonly
	*/
	async run(bot, message, settings) {
		// Check if the member has role to interact with music plugin
		if (message.guild.roles.cache.get(settings.MusicDJRole)) {
			if (!message.member.roles.cache.has(settings.MusicDJRole)) {
				return message.channel.error('misc:MISSING_ROLE');
			}
		}

		// Check that a song is being played
		const player = bot.manager?.players.get(message.guild.id);
		if (!player) return message.channel.error('music/misc:NO_QUEUE');

		// Make sure at least one previous track is recorder is not empty
		const pages = this.createPages(bot, message.guild, player);
		if (!pages) {
			const embed = new Embed(bot, message.guild)
				.setTitle(message.translate('music/previous:PREVIOUS_TRACKS'));
			return message.channel.send({ embeds: [embed] });
		}
		const pagesNum = pages.length;

		// If a user specified a page number then show page if not show pagintor.
		if (!message.args[0]) {
			if (pagesNum > 1) paginate(bot, message.channel, pages, message.author.id);
			else return message.channel.send({ embeds: [pages[0]] });
		} else {
			const pageNum = parseInt(message.args[0]);
			if (isNaN(pageNum)) return message.channel.send(message.translate('music/misc:NAN'));
			if (pageNum > pagesNum) return message.channel.send(message.translate('music/misc:TOO_HIGH', { NUM: pagesNum }));
			return message.channel.send({ embeds: [pages[Math.max(1, pageNum) - 1]] });
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
			channel = guild.channels.cache.get(interaction.channelId),
			page = args.get('page')?.value;

		// Check if the member has role to interact with music plugin
		if (guild.roles.cache.get(guild.settings.MusicDJRole)) {
			if (!member.roles.cache.has(guild.settings.MusicDJRole)) {
				return interaction.reply({ embeds: [channel.error('misc:MISSING_ROLE', {}, true)], ephemeral: true });
			}
		}

		// Check that a song is being played
		const player = bot.manager?.players.get(guild.id);
		if (!player) return interaction.reply({ embeds: [channel.error('music/misc:NO_QUEUE', {}, true)], ephemeral: true });

		const pages = this.createPages(bot, guild, player);
		if (!pages) {
			const embed = new Embed(bot, guild)
				.setTitle(guild.translate('music/previous:PREVIOUS_TRACKS'));
			return interaction.reply({ embeds: [embed] });
		}

		// If a user specified a page number then show page if not show pagintor.
		if (!page) {
			if (pages.length > 1) return paginate(bot, interaction, pages, member.id);
			return interaction.reply({ embeds: [pages[0]] });
		}
		if (page > pages.length) {
			return interaction.reply({ ephemeral: true, embeds: [channel.error('music/misc:TOO_HIGH', { NUM: pages.length }, true)] });
		}
		return interaction.reply({ embeds: [pages[Math.max(1, page) - 1]] });
	}

	/**
	 * Builds the pages of previously played tracks, newest first.
	 * @param {bot} bot The instantiating client
	 * @param {guild} guild The guild the player is in
	 * @param {Player} player The guild's player
	 * @returns {?Array<Embed>} The pages, or null when nothing has been played yet
	*/
	createPages(bot, guild, player) {
		const tracks = player.previousTracks;
		if (tracks.length == 0) return null;

		// get total page number
		const pagesNum = Math.max(1, Math.ceil(tracks.length / 10));

		// fetch data to show on pages
		const songStrings = [];
		for (let i = 0; i < tracks.length; i++) {
			const song = tracks[tracks.length - (i + 1)];
			const requester = song.requester?.id ?? song.requester;
			songStrings.push(
				`**${i + 1}.** [${song.title}](${song.uri}) \`[${song.duration ? getReadableTime(song.duration) : 'LIVE'}]\`${requester ? ` • <@${requester}>` : ''}
				`);
		}

		// create pages for pageinator
		const songText = guild.translate(tracks.length === 1 ? 'music/misc:SONG' : 'music/misc:SONGS');
		const pages = [];
		for (let i = 0; i < pagesNum; i++) {
			const str = songStrings.slice(i * 10, i * 10 + 10).join('');
			const embed = new Embed(bot, guild)
				.setAuthor({ name: guild.translate('music/previous:TITLE', { NAME: guild.name }), iconURL: guild.iconURL() })
				.setDescription(guild.translate('music/previous:LAST_TRACK', { TRACK: str ? '\n\n' + str : ` ${guild.translate('misc:NOTHING')}` }))
				.setFooter({ text: guild.translate('music/previous:PAGE', { PAGE: i + 1, PAGES: pagesNum, LENGTH: tracks.length, SONG: songText }) });
			pages.push(embed);
		}
		return pages;
	}
}

module.exports = Previous;
