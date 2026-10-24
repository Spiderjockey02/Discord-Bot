// Dependencies
const { paginate } = require('../../utils'),
	{ Embed } = require('../../utils'),
	{ time: { getReadableTime } } = require('../../utils'),
	{ PermissionsBitField: { Flags } } = require('discord.js'),
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
			slash: true,
			examples: ['previous', 'previous 2'],
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
		const pages = this.createPages(bot, message.guild, player);
		if (!pages) {
			const embed = new Embed(bot, message.guild)
				.setTitle('No previous tracks have been played');
			return message.channel.send({ embeds: [embed] });
		}
		const pagesNum = pages.length;

		// If a user specified a page number then show page if not show pagintor.
		if (!message.args[0]) {
			if (player.previousTracks.length > 10) paginate(bot, message.channel, pages, message.author.id);
			else return message.channel.send({ embeds: [pages[0]] });
		} else {
			if (isNaN(message.args[0])) return message.channel.send('Page must be a number.');
			if (message.args[0] > pagesNum) return message.channel.send(`There are only ${pagesNum} pages available.`);
			const pageNum = Math.max(1, Number(message.args[0])) - 1;
			return message.channel.send({ embeds: [pages[pageNum]] });
		}
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
	*/
	async callback(bot, interaction, guild) {
		const member = guild.members.cache.get(interaction.user.id),
			channel = guild.channels.cache.get(interaction.channelId);

		// Check if the member has role to interact with music plugin
		if (guild.roles.cache.get(guild.settings.MusicDJRole)) {
			if (!member.roles.cache.has(guild.settings.MusicDJRole)) {
				return interaction.reply({ embeds: [channel.error('misc:MISSING_ROLE', {}, true)], ephemeral: true });
			}
		}

		// Check that a song is being played
		const player = bot.manager?.players.get(guild.id);
		if (!player) return interaction.reply({ embeds: [channel.error('misc:NO_QUEUE', {}, true)], ephemeral: true });

		const pages = this.createPages(bot, guild, player);
		if (!pages) {
			const embed = new Embed(bot, guild)
				.setTitle('No previous tracks have been played');
			return interaction.reply({ embeds: [embed] });
		}
		if (pages.length > 1) return paginate(bot, interaction, pages, member.id);
		return interaction.reply({ embeds: [pages[0]] });
	}

	/**
	 * Builds the pages of previously played tracks, newest first.
	 * @param {bot} bot The instantiating client
	 * @param {guild} guild The guild the player is in
	 * @param {Player} player The guild's player
	 * @returns {?Array<Embed>} The pages, or null when nothing has been played yet
	*/
	createPages(bot, guild, player) {
		if (player.previousTracks.length == 0) return null;

		// get total page number
		const pagesNum = Math.max(1, Math.ceil(player.previousTracks.length / 10));

		// fetch data to show on pages
		const songStrings = [];
		for (let i = 0; i < player.previousTracks.length; i++) {
			const song = player.previousTracks[player.previousTracks.length - (i + 1)];
			const requester = song.requester?.id ?? song.requester;
			songStrings.push(
				`**${i + 1}.** [${song.title}](${song.uri}) \`[${song.duration ? getReadableTime(song.duration) : 'LIVE'}]\`${requester ? ` • <@${requester}>` : ''}
				`);
		}

		// create pages for pageinator
		const pages = [];
		for (let i = 0; i < pagesNum; i++) {
			const str = songStrings.slice(i * 10, i * 10 + 10).join('');
			const embed = new Embed(bot, guild)
				.setAuthor({ name: `Previous Tracks - ${guild.name}`, iconURL: guild.iconURL() })
				.setDescription(`**Last Track**: ${str == '' ? '  Nothing' : '\n\n' + str }`)
				.setFooter({ text: `Page ${i + 1}/${pagesNum} | ${player.previousTracks.length} song(s)` });
			pages.push(embed);
		}
		return pages;
	}
}

module.exports = Previous;
