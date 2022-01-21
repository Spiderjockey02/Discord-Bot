// Dependencies
const { paginate } = require('../../utils'),
	{ Embed } = require('../../utils'),
	{ time: { getReadableTime } } = require('../../utils'),
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
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
			description: 'Displays the queue.',
			usage: 'queue [pageNumber]',
			cooldown: 3000,
			examples: ['queue', 'queue 2'],
			slash: true,
			options: [{
				name: 'page',
				description: 'The page number.',
				type: 'INTEGER',
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
	async run(bot, message, settings) {
		// Check if the member has role to interact with music plugin
		if (message.guild.roles.cache.get(settings.MusicDJRole)) {
			if (!message.member.roles.cache.has(settings.MusicDJRole)) {
				return message.channel.error('misc:MISSING_ROLE').then(m => m.timedDelete({ timeout: 10000 }));
			}
		}

		// Check that a song is being played
		const player = bot.manager?.players.get(message.guild.id);
		if (!player) return message.channel.error('misc:NO_QUEUE').then(m => m.timedDelete({ timeout: 10000 }));

		// Make sure queue is not empty
		const queue = player.queue;
		if (queue.size == 0) {
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
			songStrings.push(
				`**${i + 1}.** [${song.title}](${song.uri}) \`[${getReadableTime(song.duration)}]\` • <@${!song.requester.id ? song.requester : song.requester.id}>
				`);
		}

		// create pages for pageinator
		const user = `<@${!requester.id ? requester : requester.id}>`;
		const pages = [];
		for (let i = 0; i < pagesNum; i++) {
			const str = songStrings.slice(i * 10, i * 10 + 10).join('');
			const embed = new Embed(bot, message.guild)
				.setAuthor({ name: `Queue - ${message.guild.name}`, iconURL: message.guild.iconURL() })
				.setDescription(`**Now Playing**: [${title}](${uri}) \`[${parsedDuration}]\` • ${user}.\n\n**Up Next**:${str == '' ? '  Nothing' : '\n' + str }`)
				.setFooter({ text: `Page ${i + 1}/${pagesNum} | ${player.queue.length} song(s) | ${parsedQueueDuration} total duration` });
			pages.push(embed);
		}

		// If a user specified a page number then show page if not show pagintor.
		if (!message.args[0]) {
			if (pages.length == pagesNum && player.queue.length > 10) paginate(bot, message.channel, pages);
			else return message.channel.send({ embeds: [pages[0]] });
		} else {
			if (isNaN(message.args[0])) return message.channel.send(message.translate('music/queue:NAN'));
			if (message.args[0] > pagesNum) return message.channel.send(message.translate('music/queue:TOO_HIGH', { NUM: pagesNum }));
			const pageNum = message.args[0] == 0 ? 1 : message.args[0] - 1;
			return message.channel.send({ embeds: [pages[pageNum]] });
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
		if (!player) return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:NO_QUEUE', { ERROR: null }, true)] });

		// Make sure queue is not empty
		const queue = player.queue;
		if (queue.size == 0) {
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
			songStrings.push(
				`**${i + 1}.** [${song.title}](${song.uri}) \`[${getReadableTime(song.duration)}]\` • <@${!song.requester.id ? song.requester : song.requester.id}>
				`);
		}

		// create pages for pageinator
		const user = `<@${!requester.id ? requester : requester.id}>`;
		const pages = [];
		for (let i = 0; i < pagesNum; i++) {
			const str = songStrings.slice(i * 10, i * 10 + 10).join('');
			const embed = new Embed(bot, guild)
				.setAuthor({ name: `Queue - ${guild.name}`, iconURL: guild.iconURL() })
				.setDescription(`**Now Playing**: [${title}](${uri}) \`[${parsedDuration}]\` • ${user}.\n\n**Up Next**:${str == '' ? '  Nothing' : '\n' + str }`)
				.setFooter({ text: `Page ${i + 1}/${pagesNum} | ${player.queue.length} song(s) | ${parsedQueueDuration} total duration` });
			pages.push(embed);
		}

		// If a user specified a page number then show page if not show pagintor.
		if (!page) {
			if (pages.length == pagesNum && player.queue.length > 10) {
				paginate(bot, channel, pages);
				return interaction.reply('Loaded Queue');
			} else {
				return interaction.reply(pages[0]);
			}
		} else {
			if (page > pagesNum) return interaction.reply({ ephemeral: true, embeds: [channel.error('music/queue:TOO_HIGH', { NUM: pagesNum }, true)] });
			const pageNum = page == 0 ? 1 : page - 1;
			return interaction.reply(pages[pageNum]);
		}
	}
}

module.exports = Queue;
