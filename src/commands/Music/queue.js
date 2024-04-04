// Dependencies
const { paginate, Embed, time: { getReadableTime } } = require('../../utils'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * queue command
 * @extends {Command}
*/
class Queue extends Command {
	/**
	 * @param {Client} client The instantiating client
	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'queue',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['que'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.AddReactions],
			description: 'Displays the queue.',
			usage: 'queue [pageNumber]',
			cooldown: 3000,
			examples: ['queue', 'queue 2'],
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

		// Make sure queue is not empty
		const queue = player.queue;
		if (!queue?.size) {
			const embed = new Embed(bot, message.guild)
				.setTitle('music/queue:EMPTY');
			return message.channel.send({ embeds: [embed] });
		}

		// get total page number
		let pagesNum = Math.ceil(player.queue.length / 10);
		if (pagesNum === 0) pagesNum = 1;

		// fetch data to show on pages
		const { title, requester, duration, uri } = player.queue.current;
		const parsedDuration = getReadableTime(duration);
		const parsedQueueDuration = getReadableTime(player.queue.reduce((prev, curr) => prev + curr.duration, 0) + player.queue.current.duration);
		const songStrings = [];
		for (let i = 0; i < player.queue.length; i++) {
			const song = player.queue[i];
			const user = !song.requester.id ? song.requester : song.requester.id;
			songStrings.push(
				`**${i + 1}.** [${song.title}](${song.uri}) \`[${getReadableTime(song.duration)}]\` • <@${user}>
				`);
		}

		// create pages for pageinator
		const user = `<@${!requester.id ? requester : requester.id}>`;
		const pages = [];
		for (let i = 0; i < pagesNum; i++) {
			const start = i * 10;
			const end = start + 10;
			const str = songStrings.slice(start, end).join('');

			const queuelength = player.queue.length;
			const songlength = queuelength === 1 ? bot.translate('music/misc:SONG') : bot.translate('music/misc:SONGS');
			const upnext = str ? '\n\n' + str : ` ${bot.translate('misc:NOTHING')}`;

			const embed = new Embed(bot, message.guild)
				.setAuthor(bot.translate('music/queue:TITLE', { NAME: message.guild.name }), { iconURL: message.guild.iconURL() })
				.setDescription(bot.translate('music/queue:NOW_PLAYING', { NAME: title, URI: uri, DURATION: parsedDuration, USER: user, NEXT: upnext }))
				.setFooter(bot.translate('music/queue:PAGE', { PAGE: i + 1, PAGES: pagesNum, LENGTH: queuelength, SONG: songlength, DURATION: parsedQueueDuration }));
			pages.push(embed);
		}

		// If a user specified a page number then show page if not show pagintor.
		if (!message.args[0]) {
			if (PageCheck(pages, pagesNum, player)) paginate(bot, message.channel, pages, message.author.id);
			else return message.channel.send({ embeds: [pages[0]] });
		} else {
			const pageNum = parseInt(message.args[0]);
			const pageIndex = Math.max(0, Math.min(pageNum - 1, pagesNum - 1));
			if (isNaN(pageNum)) return message.channel.send(message.translate('music/misc:NAN'));
			if (pageNum > pagesNum) return message.channel.send(message.translate('music/queue:TOO_HIGH', { NUM: pagesNum }));
			return message.channel.send({ embeds: [pages[pageIndex]] });
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
		// Check if the member has role to interact with music plugin
		const member = guild.members.cache.get(interaction.user.id);
		const channel = guild.channels.cache.get(interaction.channelId);
		const page = args.get('page')?.value;

		if (guild.roles.cache.get(guild.settings.MusicDJRole)) {
			if (!member.roles.cache.has(guild.settings.MusicDJRole)) {
				return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:MISSING_ROLE', { ERROR: null }, true)] });
			}
		}

		// Check that a song is being played
		const player = bot.manager?.players.get(guild.id);
		if (!player) return interaction.reply({ ephemeral: true, embeds: [channel.error('music/misc:NO_QUEUE', { ERROR: null }, true)] });

		// Make sure queue is not empty
		const queue = player.queue;
		if (!queue?.size) {
			const embed = new Embed(bot, guild)
				.setTitle('music/queue:EMPTY');
			return interaction.reply(embed);
		}

		// get total page number
		let pagesNum = Math.ceil(player.queue.length / 10);
		if (pagesNum === 0) pagesNum = 1;

		// fetch data to show on pages
		const { title, requester, duration, uri } = player.queue.current;
		const parsedDuration = getReadableTime(duration);
		const parsedQueueDuration = getReadableTime(player.queue.reduce((prev, curr) => prev + curr.duration, 0) + player.queue.current.duration);
		const songStrings = [];
		for (let i = 0; i < player.queue.length; i++) {
			const song = player.queue[i];
			const user = !song.requester.id ? song.requester : song.requester.id;
			songStrings.push(
				`**${i + 1}.** [${song.title}](${song.uri}) \`[${getReadableTime(song.duration)}]\` • <@${user}>
				`);
		}

		// create pages for pageinator
		const user = `<@${!requester.id ? requester : requester.id}>`;
		const pages = [];
		for (let i = 0; i < pagesNum; i++) {
			const start = i * 10;
			const end = start + 10;
			const str = songStrings.slice(start, end).join('');

			const queuelength = player.queue.length;
			const songlength = queuelength === 1 ? bot.translate('music/misc:SONG') : bot.translate('music/misc:SONGS');
			const upnext = str ? '\n\n' + str : ` ${bot.translate('misc:NOTHING')}`;

			const embed = new Embed(bot, guild)
				.setAuthor(bot.translate('music/queue:TITLE', { NAME: guild.name }), { iconURL: guild.iconURL() })
				.setDescription(bot.translate('music/queue:NOW_PLAYING', { NAME: title, URI: uri, DURATION: parsedDuration, USER: user, NEXT: upnext }))
				.setFooter(bot.translate('music/queue:PAGE', { PAGE: i + 1, PAGES: pagesNum, LENGTH: queuelength, SONG: songlength, DURATION: parsedQueueDuration }));
			pages.push(embed);
		}

		// If a user specified a page number then show page if not show pagintor.
		if (!page) {
			if (PageCheck(pages, pagesNum, player)) {
				paginate(bot, channel, pages, member.id);
				return interaction.reply(bot.translate('music/queue:LOADED'));
			} else {
				return interaction.reply({ embeds: [pages[0]] });
			}
		} else {
			if (page > pagesNum) return interaction.reply({ ephemeral: true, embeds: [channel.error('music/misc:TOO_HIGH', { NUM: pagesNum }, true)] });
			const pageNum = Math.max(0, Math.min(page - 1, pagesNum - 1));
			return interaction.reply({ embeds: [pages[pageNum]] });
		}
	}
}

function PageCheck(pages, pagesNum, player) {
	return pages.length == pagesNum && player.queue.length > 10;
}

module.exports = Queue;
