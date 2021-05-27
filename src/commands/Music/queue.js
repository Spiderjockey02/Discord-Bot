// Dependencies
const { paginate } = require('../../utils'),
	{ Embed } = require('../../utils'),
	{ time: { getReadableTime } } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Queue extends Command {
	constructor(bot) {
		super(bot, {
			name: 'queue',
			dirname: __dirname,
			aliases: ['que'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
			description: 'Displays the queue.',
			usage: 'queue [pageNumber]',
			cooldown: 3000,
			examples: ['queue', 'queue 2'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Check if the member has role to interact with music plugin
		if (message.guild.roles.cache.get(settings.MusicDJRole)) {
			if (!message.member.roles.cache.has(settings.MusicDJRole)) {
				return message.channel.error('misc:MISSING_ROLE').then(m => m.delete({ timeout: 10000 }));
			}
		}

		// Check that a song is being played
		const player = bot.manager.players.get(message.guild.id);
		if (!player) return message.channel.error('misc:NO_QUEUE').then(m => m.delete({ timeout: 10000 }));

		// Make sure queue is not empty
		const queue = player.queue;
		if (queue.size == 0) {
			const embed = new Embed(bot, message.guild)
				.setTitle('music/queue:EMPTY');
			return message.channel.send(embed);
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
				.setAuthor(`Queue - ${message.guild.name}`, message.guild.iconURL())
				.setDescription(`**Now Playing**: [${title}](${uri}) \`[${parsedDuration}]\` • ${user}.\n\n**Up Next**:${str == '' ? '  Nothing' : '\n' + str }`)
				.setFooter(`Page ${i + 1}/${pagesNum} | ${player.queue.length} song(s) | ${parsedQueueDuration} total duration`);
			pages.push(embed);
		}

		// If a user specified a page number then show page if not show pagintor.
		if (!message.args[0]) {
			if (pages.length == pagesNum && player.queue.length > 10) paginate(bot, message, pages);
			else return message.channel.send(pages[0]);
		} else {
			if (isNaN(message.args[0])) return message.channel.send(message.translate('music/queue:NAN'));
			if (message.args[0] > pagesNum) return message.channel.send(message.translate('music/queue:TOO_HIGH', { NUM: pagesNum }));
			const pageNum = message.args[0] == 0 ? 1 : message.args[0] - 1;
			return message.channel.send(pages[pageNum]);
		}
	}
};
