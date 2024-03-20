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
		if (!player) return message.channel.error('misc:NO_QUEUE');

		// Make sure at least one previous track is recorder is not empty
		const queue = player.previousTracks;
		if (queue.size == 0) {
			const embed = new Embed(bot, message.guild)
				.setTitle('No previous tracks have been played');
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
			const embed = new Embed(bot, message.guild)
				.setAuthor({ name: `Previous Tracks - ${message.guild.name}`, iconURL: message.guild.iconURL() })
				.setDescription(`**Last Track**: ${str == '' ? '  Nothing' : '\n\n' + str}`)
				.setFooter({ text: `Page ${i + 1}/${pagesNum} | ${player.previousTracks.length} song(s)` });
			pages.push(embed);
		}

		// If a user specified a page number then show page if not show pagintor.
		if (!message.args[0]) {
			if (pages.length == pagesNum && player.previousTracks.length > 10) paginate(bot, message, pages, message.author.id);
			else return message.channel.send({ embeds: [pages[0]] });
		} else {
			if (isNaN(message.args[0])) return message.channel.send('Page must be a number.');
			if (message.args[0] > pagesNum) return message.channel.send(`There are only ${pagesNum} pages available.`);
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

		// Check if the member has role to interact with music plugin
		if (guild.roles.cache.get(guild.settings.MusicDJRole)) {
			if (!member.roles.cache.has(guild.settings.MusicDJRole)) {
				return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:MISSING_ROLE', { ERROR: null }, true)] });
			}
		}

		// Check that a song is being played
		const player = bot.manager?.players.get(guild.id);
		if (!player) return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:NO_QUEUE', { ERROR: null }, true)] });

		// Make sure at least one previous track is recorder is not empty
		const queue = player.previousTracks;
		if (queue.size == 0) {
			const embed = new Embed(bot, guild)
				.setTitle('No previous tracks have been played');
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
			const embed = new Embed(bot, guild)
				.setAuthor({ name: `Previous Tracks - ${guild.name}`, iconURL: guild.iconURL() })
				.setDescription(`**Last Track**: ${str == '' ? '  Nothing' : '\n\n' + str}`)
				.setFooter({ text: `Page ${i + 1}/${pagesNum} | ${player.previousTracks.length} song(s)` });
			pages.push(embed);
		}

		// If a user specified a page number then show page if not show pagintor.
		if (!page) {
			if (pages.length == pagesNum && player.previousTracks.length > 10) paginate(bot, interaction, pages, member.id);
			else return interaction.reply({ embeds: [pages[0]] });
		} else {
			if (page > pagesNum) return interaction.reply({ content: `There are only ${pagesNum} pages available.` });
			const pageNum = page == 0 ? 1 : page - 1;
			return interaction.reply({ embeds: [pages[pageNum]] });
		}
	}
}

module.exports = Previous;
