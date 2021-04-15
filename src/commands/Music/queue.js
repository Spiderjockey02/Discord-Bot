// Dependencies
const paginate = require('../../utils/pagenator'),
	{ MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Queue extends Command {
	constructor(bot) {
		super(bot, {
			name: 'queue',
			dirname: __dirname,
			aliases: ['que'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
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
				return message.channel.error(settings.Language, 'MUSIC/MISSING_DJROLE').then(m => m.delete({ timeout: 10000 }));
			}
		}

		// Check that a song is being played
		const player = bot.manager.players.get(message.guild.id);
		if (!player) return message.channel.error(settings.Language, 'MUSIC/NO_QUEUE').then(m => m.delete({ timeout: 5000 }));

		// Check if bot has permission to connect to voice channel
		if (!message.channel.permissionsFor(message.guild.me).has('ADD_REACTIONS')) {
			bot.logger.error(`Missing permission: \`ADD_REACTIONS\` in [${message.guild.id}].`);
			return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'ADD_REACTIONS').then(m => m.delete({ timeout: 10000 }));
		}

		// Check if bot has permission to delete emojis
		if (!message.channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES')) {
			bot.logger.error(`Missing permission: \`MANAGE_MESSAGES\` in [${message.guild.id}].`);
			return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'MANAGE_MESSAGES').then(m => m.delete({ timeout: 10000 }));
		}

		// Make sure queue is not empty
		const queue = player.queue;
		if (queue.size == 0) {
			const embed = new MessageEmbed()
				.setTitle('Queue is empty');
			return message.channel.send(embed);
		}

		// get total page number
		let pagesNum = Math.ceil(player.queue.length / 10);
		if (pagesNum === 0) pagesNum = 1;

		// fetch data to show on pages
		const { title, requester, duration, uri } = player.queue.current;
		const parsedDuration = bot.timeFormatter.getReadableTime(duration);
		const parsedQueueDuration = bot.timeFormatter.getReadableTime(player.queue.reduce((prev, curr) => prev + curr.duration, 0) + player.queue.current.duration);
		const songStrings = [];
		for (let i = 0; i < player.queue.length; i++) {
			const song = player.queue[i];
			songStrings.push(
				`**${i + 1}.** [${song.title}](${song.uri}) \`[${bot.timeFormatter.getReadableTime(song.duration)}]\` • <@${!song.requester.id ? song.requester : song.requester.id}>
				`);
		}

		// create pages for pageinator
		const user = `<@${!requester.id ? requester : requester.id}>`;
		const pages = [];
		for (let i = 0; i < pagesNum; i++) {
			const str = songStrings.slice(i * 10, i * 10 + 10).join('');
			const embed = new MessageEmbed()
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
			if (isNaN(message.args[0])) return message.channel.send('Page must be a number.');
			if (message.args[0] > pagesNum) return message.channel.send(`There are only ${pagesNum} pages available.`);
			const pageNum = message.args[0] == 0 ? 1 : message.args[0] - 1;
			return message.channel.send(pages[pageNum]);
		}
	}
};
