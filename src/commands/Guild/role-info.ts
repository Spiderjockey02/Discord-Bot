import EgglordClient from 'base/Egglord';
import { Command, EgglordEmbed } from '../../structures';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, Message, Role, User } from 'discord.js';
import moment from 'moment';

/**
 * Role-info command
 * @extends {Command}
*/
export default class RoleInfo extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor(client: EgglordClient) {
		super(client, {
			name:  'role-info',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['roleinfo'],
			description: 'Get information on a role.',
			usage: 'role-info <role>',
			cooldown: 2000,
			examples: ['role-info roleID', 'role-info @mention', 'role-info name'],
			slash: true,
			options: [{
				name: 'role',
				description: 'Get information of the role.',
				type: ApplicationCommandOptionType.Role,
				required: true,
			}],
		});
	}

	async run(client: EgglordClient, message: Message<true>) {
		// Check to see if a role was mentioned
		const roles = message.getRole();

		const embed = this.createEmbed(client, roles[0], message.author);
		message.channel.send({ embeds: [embed] });
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const role = interaction.options.getRole('role', true);

		// send embed
		const embed = this.createEmbed(client, role, interaction.user);
		console.log(embed.data.fields);
		interaction.reply({ embeds: [embed] });
	}

	/**
	 * Function for creating embed of role information.
	 * @param {client} client The instantiating client
	 * @param {role} Role The role to get information from
	 * @param {user} User The user for embed#footer
	 * @returns {embed}
	*/
	createEmbed(client: EgglordClient, role: Role, user: User) {
		// translate permissions
		const permissions = role.permissions.toArray().map((p) => role.client.languageManager.translate(role.guild, `permissions:${p}`)).join(' » ');
		// Send information to channel
		return new EgglordEmbed(client, role.guild)
			.setColor(role.color)
			.setAuthor({ name: user.displayName, iconURL: user.displayAvatarURL() })
			.setDescription(client.languageManager.translate(role.guild, 'guild/role-info:NAME', { NAME: role.name }))
			.addFields(
				{ name: 'djhkgdhgj', value: role.members.size.toLocaleString(role.guild.settings?.language), inline: true },
				{ name: `${client.languageManager.translate(role.guild, 'guild/role-info:COLOR')}`, value: role.hexColor, inline: true },
				{ name: client.languageManager.translate(role.guild, 'guild/role-info:POSITION'), value: `${role.position}`, inline: true },
				{ name: client.languageManager.translate(role.guild, 'guild/role-info:MENTION'), value: `<@&${role.id}>`, inline: true },
				{ name: client.languageManager.translate(role.guild, 'guild/role-info:HOISTED'), value: `${role.hoist}`, inline: true },
				{ name: client.languageManager.translate(role.guild, 'guild/role-info:MENTIONABLE'), value: `${role.mentionable}`, inline: true },
				{ name: client.languageManager.translate(role.guild, 'guild/role-info:PERMISSION'), value: permissions },
				{ name: client.languageManager.translate(role.guild, 'guild/role-info:CREATED'), value: moment(role.createdAt).format('lll') },
			)
			.setTimestamp()
			.setFooter({ text: client.languageManager.translate(role.guild, 'guild/role-info:FOOTER', { MEMBER: user.displayName, ID: role.id }) });
	}
}

