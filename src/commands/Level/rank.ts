// Dependencies
const { AttachmentBuilder, ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	{ Rank: rank } = require('canvacord'),
	Command = require('../../structures/Command.js');

/**
 * Rank command
 * @extends {Command}
*/
class Rank extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'rank',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['lvl', 'level'],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.AttachFiles],
			description: 'Shows your rank/Level.',
			usage: 'level [username]',
			cooldown: 3000,
			examples: ['level userID', 'level @mention', 'level username'],
			slash: true,
			options: [{
				name: 'user',
				description: 'The user you want to view the rank of.',
				type: ApplicationCommandOptionType.User,
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
		// Get user
		const members = await message.getMember();

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// Retrieve Rank from databse
		try {
			const res = await this.createRankCard(bot, message.guild, message.author, members[0], message.channel);
			msg.delete();
			if (typeof (res) == 'object' && !res.description) {
				await message.channel.send({ files: [res] });
			} else if (res.description) {
				await message.channel.send({ embeds: [res] });
			} else {
				await message.channel.send(res);
			}
		} catch (err) {
			msg.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
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
		const channel = guild.channels.cache.get(interaction.channelId),
			member = guild.members.cache.get(args.get('user')?.value) ?? interaction.member;

		// Retrieve Rank from databse
		try {
			const res = await this.createRankCard(bot, guild, interaction.user, member, channel);
			if (res.attachment && res.name == 'RankCard.png') {
				await interaction.reply({ files: [res] });
			} else {
				await interaction.reply({ embeds: [res] });
			}
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.reply({ ephemeral: true, embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)] });
		}
	}

	/**
 	 * Function for fetching meme embed.
 	 * @param {bot} bot The instantiating client
	 * @param {guild} guild The guild the command ran in
	 * @param {author} User The user who ran the command
 	 * @param {target} guildMember The member who's rank is being checked
 	 * @param {channel} channel The channel the command ran in
 	 * @returns {embed}
	*/
	async createRankCard(bot, guild, author, target, channel) {
		// make sure it's not a bot
		if (target.user.bot) return channel.error('level/rank:NO_BOTS', null, true);

		// sort and find user
		const res = guild.levels.sort(({ Xp: a }, { Xp: b }) => b - a);
		const user = res.find(doc => doc.userID == target.user.id);

		// if they haven't send any messages
		if (!user) {
			if (author.id == target.user.id) return channel.error('level/rank:NO_MESSAGES', null, true);
			return channel.error('level/rank:MEMBER_MESSAGE', null, true);
		}

		// Get rank
		const rankScore = res.indexOf(res.find(i => i.userID == target.user.id));

		// create rank card
		const rankcard = new rank()
			.setAvatar(target.user.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 }))
			.setCurrentXP(user.Level == 1 ? user.Xp : (user.Xp - (5 * ((user.Level - 1) ** 2) + 50 * (user.Level - 1) + 100)))
			.setLevel(user.Level)
			.setRank(rankScore + 1)
			.setRequiredXP((5 * (user.Level ** 2) + 50 * user.Level + 100) - (user.Level == 1 ? 0 : (5 * ((user.Level - 1) ** 2) + 50 * (user.Level - 1) + 100)))
			.setStatus(target.presence?.status ?? 'dnd')
			.setProgressBar(['#FFFFFF', '#DF1414'], 'GRADIENT')
			.setUsername(target.user.displayName);
		if (target.user.rankImage && target.user.premium) rankcard.setBackground('IMAGE', target.user.rankImage);

		// create rank card
		const buffer = await rankcard.build();
		return new AttachmentBuilder(buffer, { name: 'RankCard.png' });
	}
}

module.exports = Rank;
