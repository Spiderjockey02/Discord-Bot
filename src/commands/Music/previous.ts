// Dependencies
const { paginate, functions: { checkMusic } } = require('../../utils'),
	{ Embed } = require('../../utils'),
	{ time: { getReadableTime } } = require('../../utils'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * previous command
 * @extends {Command}
*/
export default class Previous extends Command {
	/**
	 * @param {Client} client The instantiating client
	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
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
	 * @param {client} client The instantiating client
	 * @param {message} message The message that ran the command
	 * @readonly
	*/
	async run(client, message) {

		// Check that a song is being played
		const player = client.manager?.players.get(message.guild.id);

		// check for DJ role, same VC and that a song is actually playing
		const playable = typeof checkMusic(message.member, client) === 'boolean';
		if (!playable) {
			return message.channel.error(playable);
		}

		// Make sure at least one previous track is recorder is not empty
		const queue = player.previousTracks;
		if (!queue?.size) {
			const embed = new Embed(client, message.guild)
				.setTitle(client.translate('music/previous:PREVIOUS_TRACKS'));
			return message.channel.send({ embeds: [embed] });
		}

		// get total page number
		const pagesNum = Math.max(Math.ceil(player.previousTracks.length / 10), 1);

		// fetch data to show on pages
		const songStrings = [];
		for (let i = 0; i < player.previousTracks.length; i++) {
			const song = player.previousTracks[player.previousTracks.length - (i + 1)];
			const user = song.requester.id ?? song.requester;
			songStrings.push(
				`**${i + 1}.** [${song.title}](${song.uri}) \`[${getReadableTime(song.duration)}]\` • <@${user}>
				`);
		}
		// create pages for pageinator
		const pages = [];
		for (let i = 0; i < pagesNum; i++) {
			const start = i * 10;
			const end = start + 10;
			const str = songStrings.slice(start, end).join('');

			const previouslength = player.previousTracks.length;
			const songTextKey = previouslength === 1 ? 'music/misc:SONG' : 'music/misc:SONGS';
			const songlength = client.translate(songTextKey);
			const lasttracklength = str ? '\n\n' + str : ` ${client.translate('misc:NOTHING')}`;

			const embed = new Embed(client, message.guild)
				.setAuthor(client.translate('music/previous:TITLE', { NAME: message.guild.name }), { iconURL: message.guild.iconURL() })
				.setDescription(client.translate('music/previous:LAST_TRACK', { TRACK: lasttracklength }))
				.setFooter(client.translate('music/previous:PAGE', { PAGE: i + 1, PAGES: pagesNum, LENGTH: previouslength, SONG: songlength }));
			pages.push(embed);
		}

		// If a user specified a page number then show page if not show pagintor.
		if (!message.args[0]) {
			if (PageCheck(pages, pagesNum, player)) {
				paginate(client, message, pages, message.author.id);
			} else {
				return message.channel.send({ embeds: [pages[0]] });
			}
		} else {
			const pageNum = parseInt(message.args[0]);
			const pageIndex = Math.max(0, Math.min(pageNum - 1, pagesNum - 1));
			if (isNaN(pageNum)) return message.channel.send(client.translate('music/misc:NAN'));
			if (pageNum > pagesNum) return message.channel.send(client.translate('music/misc:TOO_HIGH', { NUM: pagesNum }));
			return message.channel.send({ embeds: [pages[pageIndex]] });
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
		const member = guild.members.cache.get(interaction.user.id);
		const channel = guild.channels.cache.get(interaction.channelId);
		const page = args.get('page')?.value;

		// Check that a song is being played
		const player = client.manager?.players.get(guild.id);

		// check for DJ role, same VC and that a song is actually playing
		const playable = typeof checkMusic(member, client) === 'boolean';
		if (!playable) {
			return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });
		}


		// Make sure at least one previous track is recorder is not empty
		const queue = player.previousTracks;
		if (!queue?.size) {
			const embed = new Embed(client, guild)
				.setTitle(client.translate('music/previous:PREVIOUS_TRACKS'));
			return interaction.reply({ embeds: [embed] });
		}

		// get total page number
		const pagesNum = Math.max(Math.ceil(player.previousTracks.length / 10), 1);

		// fetch data to show on pages
		const songStrings = [];
		for (let i = 0; i < player.previousTracks.length; i++) {
			const song = player.previousTracks[player.previousTracks.length - (i + 1)];
			const user = !song.requester.id ? song.requester : song.requester.id;
			songStrings.push(
				`**${i + 1}.** [${song.title}](${song.uri}) \`[${getReadableTime(song.duration)}]\` • <@${user}>
				`);
		}
		// create pages for pageinator
		const pages = [];
		for (let i = 0; i < pagesNum; i++) {
			const start = i * 10;
			const end = start + 10;
			const str = songStrings.slice(start, end).join('');

			const previouslength = player.previousTracks.length;
			const songTextKey = previouslength === 1 ? 'music/misc:SONG' : 'music/misc:SONGS';
			const songlength = client.translate(songTextKey);
			const lasttracklength = str ? '\n\n' + str : ` ${client.translate('misc:NOTHING')}`;

			const embed = new Embed(client, guild)
				.setAuthor(client.translate('music/previous:TITLE', { NAME: guild.name }), { iconURL: guild.iconURL() })
				.setDescription(client.translate('music/previous:LAST_TRACK', { TRACK: lasttracklength }))
				.setFooter(client.translate('music/previous:PAGE', { PAGE: i + 1, PAGES: pagesNum, LENGTH: previouslength, SONG: songlength }));
			pages.push(embed);
		}

		// If a user specified a page number then show page if not show pagintor.
		if (!page) {
			if (PageCheck(pages, pagesNum, player)) {
				paginate(client, interaction, pages, member.id);
				return interaction.reply(client.translate('music/previous:LOADED'));
			} else {
				return interaction.reply({ embeds: [pages[0]] });
			}
		} else {
			const pageNum = Math.max(0, Math.min(page - 1, pagesNum - 1));
			if (page > pagesNum) {
				return interaction.reply({ ephemeral: true, embeds: [channel.error('music/misc:TOO_HIGH', { NUM: pagesNum }, true)] });
			}
			return interaction.reply({ embeds: [pages[pageNum]] });
		}
	}
}

function PageCheck(pages, pagesNum, player) {
	return pages.length == pagesNum && player.previousTracks.length > 10;
}

