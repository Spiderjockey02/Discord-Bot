// Dependencies
const { paginate, functions: { checkMusic } } = require('../../utils'),
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
	 * @readonly
	*/
	async run(bot, message) {

		// Check that a song is being played
		const player = bot.manager?.players.get(message.guild.id);

		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(message.member, bot);
		if (typeof (playable) !== 'boolean') return message.channel.error(playable);

		// Make sure at least one previous track is recorder is not empty
		const queue = player.previousTracks;
		if (queue.size == 0) {
			const embed = new Embed(bot, message.guild)
				.setTitle(bot.translate('music/previous:PREVIOUS_TRACKS'));
			return message.channel.send({ embeds: [embed] });
		}

		// get total page number
		let pagesNum = Math.ceil(player.previousTracks.length / 10);
		if (pagesNum === 0) pagesNum = 1;

		// fetch data to show on pages
		const songStrings = [];
		for (let i = 0; i < player.previousTracks.length; i++) {
			const song = player.previousTracks[player.previousTracks.length - (i + 1)];
			songStrings.push(
				`**${i + 1}.** [${song.title}](${song.uri}) \`[${getReadableTime(song.duration)}]\` • <@${!song.requester.id ? song.requester : song.requester.id}>
				`);
		}
		// create pages for pageinator
		const pages = [];
		for (let i = 0; i < pagesNum; i++) {
			const str = songStrings.slice(i * 10, i * 10 + 10).join('');
			// How many previous tracks there are
			const previouslength = player.previousTracks.length;
			// If the amount of prevous tracks is 1 use song else use songs
			const songlength = previouslength === 1 ? bot.translate('music/misc:SONG') : bot.translate('music/misc:SONGS');
			// If there aren't previous tracks use nothing else use the tracks
			const lasttracklength = str == '' ? ` ${bot.translate('misc:NOTHING')}` : '\n\n' + str;
			const embed = new Embed(bot, message.guild)
				.setAuthor(bot.translate('music/previous:TITLE', { NAME: message.guild.name }), { iconURL: message.guild.iconURL() })
				.setDescription(bot.translate('music/previous:LAST_TRACK', { TRACK: lasttracklength }))
				.setFooter(bot.translate('music/previous:PAGE', { PAGE: i + 1, PAGES: pagesNum, LENGTH: previouslength, SONG: songlength }));
			pages.push(embed);
		}

		// If a user specified a page number then show page if not show pagintor.
		if (!message.args[0]) {
			if (pages.length == pagesNum && player.previousTracks.length > 10) paginate(bot, message, pages, message.author.id);
			else return message.channel.send({ embeds: [pages[0]] });
		} else {
			if (isNaN(message.args[0])) return message.channel.send(bot.translate('music/misc:NAN'));
			if (message.args[0] > pagesNum) return message.channel.send(bot.translate('music/misc:TOO_HIGH', { NUM: pagesNum }));
			const pageNum = message.args[0] == 0 ? 1 : message.args[0] - 1;
			return message.channel.send({ embeds: [pages[pageNum]] });
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
		const member = guild.members.cache.get(interaction.user.id);
		const channel = guild.channels.cache.get(interaction.channelId);
		const page = args.get('page')?.value;

		// Check that a song is being played
		const player = bot.manager?.players.get(guild.id);

		// check for DJ role, same VC and that a song is actually playing
		const playable = checkMusic(member, bot);
		if (typeof (playable) !== 'boolean') return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });

		// Make sure at least one previous track is recorder is not empty
		const queue = player.previousTracks;
		if (queue.size == 0) {
			const embed = new Embed(bot, guild)
				.setTitle(bot.translate('music/previous:PREVIOUS_TRACKS'));
			return interaction.reply({ embeds: [embed] });
		}

		// get total page number
		let pagesNum = Math.ceil(player.previousTracks.length / 10);
		if (pagesNum === 0) pagesNum = 1;

		// fetch data to show on pages
		const songStrings = [];
		for (let i = 0; i < player.previousTracks.length; i++) {
			const song = player.previousTracks[player.previousTracks.length - (i + 1)];
			songStrings.push(
				`**${i + 1}.** [${song.title}](${song.uri}) \`[${getReadableTime(song.duration)}]\` • <@${!song.requester.id ? song.requester : song.requester.id}>
				`);
		}
		// create pages for pageinator
		const pages = [];
		for (let i = 0; i < pagesNum; i++) {
			const str = songStrings.slice(i * 10, i * 10 + 10).join('');
			// How many previous tracks there are
			const previouslength = player.previousTracks.length;
			// If the amount of prevous tracks is 1 use song else use songs
			const songlength = previouslength === 1 ? bot.translate('music/misc:SONG') : bot.translate('music/misc:SONGS');
			// If there aren't previous tracks use nothing else use the tracks
			const lasttracklength = str == '' ? ` ${bot.translate('misc:NOTHING')}` : '\n\n' + str;
			const embed = new Embed(bot, guild)
				.setAuthor(bot.translate('music/previous:TITLE', { NAME: guild.name }), { iconURL: guild.iconURL() })
				.setDescription(bot.translate('music/previous:LAST_TRACK', { TRACK: lasttracklength }))
				.setFooter(bot.translate('music/previous:PAGE', { PAGE: i + 1, PAGES: pagesNum, LENGTH: previouslength, SONG: songlength }));
			pages.push(embed);
		}

		// If a user specified a page number then show page if not show pagintor.
		if (!page) {
			if (pages.length == pagesNum && player.previousTracks.length > 10) paginate(bot, interaction, pages, member.id);
			else return interaction.reply({ embeds: [pages[0]] });
		} else {
			if (page > pagesNum) return interaction.reply({ ephemeral: true, embeds: [channel.error('music/misc:TOO_HIGH', { NUM: pagesNum }, true)] });
			const pageNum = page == 0 ? 1 : page - 1;
			return interaction.reply({ embeds: [pages[pageNum]] });
		}
	}
}

module.exports = Previous;
