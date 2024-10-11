import { ActivityType, ApplicationCommandOptionType, ChatInputCommandInteraction, GuildMember, Message, UserContextMenuCommandInteraction } from 'discord.js';
import { Command, EgglordEmbed } from '../../structures';
import EgglordClient from 'base/Egglord';
import moment from 'moment';

/**
 * User-info command
 * @extends {Command}
*/
export default class UserInfo extends Command {
	/**
	 * @param {Client} client The instantiating client
	 * @param {CommandData} data The data for the command
	*/
	constructor(client: EgglordClient) {
		super(client, {
			name: 'user-info',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['userinfo', 'whois'],
			description: 'Get information on a user.',
			usage: 'user-info [user]',
			cooldown: 2000,
			examples: ['user-info userID', 'user-info @mention', 'user-info username'],
			slash: true,
			options: [{
				name: 'user',
				description: 'The user you want to get information of',
				type: ApplicationCommandOptionType.User,
				required: false,
			}],
		});
	}

	async run(client: EgglordClient, message: Message<true>) {
		// Get user
		const members = await message.getMember();
		const embed = await this.createEmbed(client, members[0]);

		// send user info
		message.channel.send({ embeds: [embed] });
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const member = await interaction.guild.members.fetch(interaction.options.getUser('user') ?? interaction.user.id);

		// send embed
		const embed = await this.createEmbed(client, member);
		interaction.reply({ embeds: [embed] });
	}

	async reply(client: EgglordClient, interaction: UserContextMenuCommandInteraction) {
		let member;
		if (interaction.guild == null) {
			member = {
				user: interaction.targetUser,
				guild: null,
				roles: {
					cache: [],
					highest: {
						color: '#ffffff',
					},
				},
			} as unknown as GuildMember;
		} else {
			member = interaction.guild.members.cache.get(interaction.targetUser.id) as GuildMember;
		}

		// send embed
		const embed = await this.createEmbed(client, member);
		return interaction.reply({ embeds: [embed] });
	}

	async createEmbed(client: EgglordClient, member: GuildMember) {
		const roles = [...member.roles.cache.sort((a, b) => b.position - a.position).values()];
		const supportGuild = client.guilds.cache.get(client.config.SupportServer.GuildID);
		let isContributor, isSupport, isDev = false;

		try {
			const memberInSupportGuild = await supportGuild?.members.fetch(member.user.id);
			if (memberInSupportGuild !== undefined) {
				isContributor = memberInSupportGuild.roles.cache.some(role => role.id === client.config.Staff.ContributorRole);
				isSupport = memberInSupportGuild.roles.cache.some(role => role.id === client.config.Staff.SupportRole);
				isDev = memberInSupportGuild.roles.cache.some(role => role.id === client.config.Staff.DeveloperRole);
			}
		} catch (err: any) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
		}

		while (roles.join(', ').length >= 1021) {
			roles.pop();
		}

		// Check if user has status
		let status = 'None';
		if (member.guild) {
			status = (member.presence?.activities.length ?? 0 >= 1)
				? `${member.presence?.activities[0].name} - ${(member.presence?.activities[0].type == ActivityType.Custom) ? member.presence.activities[0].state : member.presence?.activities[0].details}`
				: 'None';
		}

		const embed = new EgglordEmbed(client, member.guild)
			.setAuthor({ name: member.user.displayName, iconURL: member.user.displayAvatarURL() })
			.setColor(member.roles.highest.color)
			.setThumbnail(member.user.displayAvatarURL({ size: 512 }))
			.addFields(
				{ name: client.languageManager.translate(member.guild, 'guild/user-info:USERNAME'), value: member.user.displayName, inline: true },
				{ name: client.languageManager.translate(member.guild, 'guild/user-info:ROBOT', {}), value: client.languageManager.translate(member.guild, `misc:${member.user.client ? 'YES' : 'NO'}`, {}), inline: true },
				{ name: client.languageManager.translate(member.guild, 'guild/user-info:CREATE', {}), value: moment(member.user.createdAt).format('lll'), inline: true },
				{ name: client.languageManager.translate(member.guild, 'guild/user-info:STATUS', {}), value: `\`${status}\``, inline: true },
			);

		// Guild only values
		if (member.guild) {
			const role = (roles.length != member.roles.cache.size) ? '...' : '.';
			const nick = member.nickname != null ? member.nickname : client.languageManager.translate(member.guild, 'misc:NONE', {});
			embed.addFields({ name: client.languageManager.translate(member.guild, 'guild/user-info:ROLE', {}), value: `${member.roles.highest}`, inline: true },
				{ name: client.languageManager.translate(member.guild, 'guild/user-info:JOIN', {}), value: moment(member.joinedAt).format('lll'), inline: true },
				{ name: client.languageManager.translate(member.guild, 'guild/user-info:NICK', {}), value: nick, inline: true },
				{ name: client.languageManager.translate(member.guild, 'guild/user-info:ROLES', {}), value: `${roles.join(', ')}${role}` });
		}

		// Staff only vales
		if (isContributor || isSupport || isDev) {
			const contributer = isContributor ? `${supportGuild?.roles.cache.find(role => role.id === client.config.Staff.ContributorRole)?.name}` : '';
			const support = isSupport ? `${supportGuild?.roles.cache.find(role => role.id === client.config.Staff.SupportRole)?.name}` : '';
			const dev = isDev ? `${supportGuild?.roles.cache.find(role => role.id === client.config.Staff.DeveloperRole)?.name}` : '';
			embed.addFields({ name: client.languageManager.translate(member.guild, 'guild/user-info:BOT', {}), value: `${contributer} ${support} ${dev}`, inline: true });
		}
		return embed;
	}
}

