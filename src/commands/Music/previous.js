// Dependencies
const paginate = require('../../utils/pagenator'),
	{ MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Previous extends Command {
	constructor(bot) {
		super(bot, {
			name: 'previous',
			dirname: __dirname,
			aliases: ['played'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'SPEAK'],
			description: 'Displays the previous tracks that have been played.',
			usage: 'previous [pageNumber]',
			cooldown: 3000,
			examples: ['previous', 'previous 2'],
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
		if (!player) return message.channel.error(settings.Language, 'MUSIC/NO_QUEUE').then(m => setTimeout(() => { m.delete(); }, 5000));

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

		// Make sure at least one previous track is recorder is not empty
		const queue = player.previousTracks;
		if (queue.size == 0) {
			const embed = new MessageEmbed()
				.setTitle('No previous tracks have been played');
			return message.channel.send(embed);
		}

		// get total page number
		let pagesNum = Math.ceil(player.previousTracks.length / 10);
		if (pagesNum === 0) pagesNum = 1;

		// fetch data to show on pages
		const songStrings = [];
		for (let i = 0; i < player.previousTracks.length; i++) {
			const song = player.previousTracks[player.previousTracks.length - (i + 1)];
			songStrings.push(
				`**${i + 1}.** [${song.title}](${song.uri}) \`[${bot.timeFormatter.getReadableTime(song.duration)}]\` • <@${!song.requester.id ? song.requester : song.requester.id}>
				`);
		}
		// create pages for pageinator
		const pages = [];
		for (let i = 0; i < pagesNum; i++) {
			const str = songStrings.slice(i * 10, i * 10 + 10).join('');
			const embed = new MessageEmbed()
				.setAuthor(`Previous Tracks - ${message.guild.name}`, message.guild.iconURL())
				.setDescription(`**Last Track**: ${str == '' ? '  Nothing' : '\n\n' + str }`)
				.setFooter(`Page ${i + 1}/${pagesNum} | ${player.previousTracks.length} song(s)`);
			pages.push(embed);
		}

		// If a user specified a page number then show page if not show pagintor.
		if (!message.args[0]) {
			if (pages.length == pagesNum && player.previousTracks.length > 10) paginate(bot, message, pages);
			else return message.channel.send(pages[0]);
		} else {
			if (isNaN(message.args[0])) return message.channel.send('Page must be a number.');
			if (message.args[0] > pagesNum) return message.channel.send(`There are only ${pagesNum} pages available.`);
			const pageNum = message.args[0] == 0 ? 1 : message.args[0] - 1;
			return message.channel.send(pages[pageNum]);
		}
	}
};
