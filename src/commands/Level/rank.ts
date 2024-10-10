import EgglordClient from 'base/Egglord';
import { Command, ErrorEmbed } from '../../structures';
import { ApplicationCommandOptionType, AttachmentBuilder, ChatInputCommandInteraction, GuildMember, Message, PermissionFlagsBits, User } from 'discord.js';
import { RankCardBuilder, Font } from 'canvacord';
Font.loadDefault();

/**
 * Rank command
 * @extends {Command}
*/
export default class Rank extends Command {
	constructor(client: EgglordClient) {
		super(client, {
			name: 'rank',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['lvl', 'level'],
			botPermissions: [PermissionFlagsBits.AttachFiles],
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

	async run(client: EgglordClient, message: Message<true>) {
		// Get user
		const members = await message.getMember();

		// send 'waiting' message to show client has recieved message
		const msg = await message.channel.send(
			client.languageManager.translate(message.guild, 'misc:FETCHING', {
				EMOJI: client.customEmojis['loading'], ITEM: this.help.name }));

		// Retrieve Rank from databse
		try {
			const res = await this.createRankCard(client, members[0], message.author);
			msg.delete();
			if (res instanceof AttachmentBuilder) {
				await message.channel.send({ files: [res] });
			} else {
				await message.channel.send({ embeds: [res] });
			}
		} catch (err: any) {
			msg.delete();
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);

			const embed = new ErrorEmbed(client, message.guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
			return message.channel.send({ embeds: [embed] });
		}
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const targetMember = interaction.options.getMember('user') ?? interaction.member;

		// Retrieve Rank from databse
		try {
			const res = await this.createRankCard(client, targetMember, interaction.user);
			if (res instanceof AttachmentBuilder) {
				await interaction.reply({ files: [res] });
			} else {
				await interaction.reply({ embeds: [res] });
			}
		} catch (err: any) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);

			const embed = new ErrorEmbed(client, interaction.guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}
	}

	/**
 	 * Function for fetching meme embed.
 	 * @param {client} client The instantiating client
	 * @param {guild} guild The guild the command ran in
	 * @param {author} User The user who ran the command
 	 * @param {target} guildMember The member who's rank is being checked
 	 * @param {channel} channel The channel the command ran in
 	 * @returns {embed}
	*/
	async createRankCard(client: EgglordClient, targetMember: GuildMember, user: User) {
		// make sure it's not a bot
		if (targetMember.user.bot) {
			const embed = new ErrorEmbed(client, targetMember.guild)
				.setMessage('level/rank:NO_BOTS');
			return embed;
		}

		// Find the user's stats on the database
		const rank = await targetMember.guild.levels?.fetch(targetMember.id);

		// if they haven't send any messages
		if (!rank) {
			const embed = new ErrorEmbed(client, targetMember.guild)
				.setMessage(targetMember.id == user.id ? 'level/rank:NO_MESSAGES' : 'level/rank:MEMBER_MESSAGE');
			return embed;
		}

		// Get their position from the leaderboard
		const rankScore = await targetMember.guild.levels?.fetchUsersPosition(targetMember.id) ?? -1;

		// create rank card
		const rankcard = new RankCardBuilder()
			.setAvatar(targetMember.user.displayAvatarURL({ extension: 'png', forceStatic: true, size: 1024 }))
			.setCurrentXP(rank.level == 1 ? rank.xp : (rank.xp - (5 * ((rank.level - 1) ** 2) + 50 * (rank.level - 1) + 100)))
			.setLevel(rank.level)
			.setRank(rankScore + 1)
			.setRequiredXP((5 * (rank.level ** 2) + 50 * rank.level + 100) - (rank.level == 1 ? 0 : (5 * ((rank.level - 1) ** 2) + 50 * (rank.level - 1) + 100)))
			.setStatus(targetMember.presence?.status ?? 'dnd')
			.setUsername(targetMember.user.displayName);

		// create rank card
		const buffer = await rankcard.build();
		return new AttachmentBuilder(buffer, { name: 'RankCard.png' });
	}
}

