import { Command, EgglordEmbed } from '../../structures';
import EgglordClient from 'base/Egglord';
import { ChatInputCommandInteraction, GatewayIntentBits, Guild, Message, User } from 'discord.js';
import moment from 'moment';

/**
 * Server-info command
 * @extends {Command}
*/
export default class ServerInfo extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor(client: EgglordClient) {
		super(client, {
			name:  'server-info',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['serverinfo', 'guildinfo'],
			description: 'Get information on the server.',
			usage: 'server-info',
			cooldown: 2000,
			slash: true,
		});
	}

	async run(client: EgglordClient, message: Message<true>) {
		// Sort roles by position
		const embed = await this.createEmbed(client, message.guild, message.author);
		message.channel.send({ embeds: [embed] });
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const user = interaction.member.user;

		// send embed
		const embed = await this.createEmbed(client, interaction.guild, user);
		interaction.reply({ embeds: [embed] });
	}

	async createEmbed(client: EgglordClient, guild: Guild, user: User) {
		const member = guild.members.cache;
		const roles = [...guild.roles.cache.sort((a, b) => b.position - a.position).values()];
		while (roles.join(', ').length >= 1021) {
			roles.pop();
		}

		// Format the guild's features for better readability
		const guildFeatures = (guild.features.length == 0) ? client.languageManager.translate(guild, 'misc:NONE') : guild.features.map(c => client.languageManager.translate(guild, `features:${c}`)).join(', ');

		// Check the guild member's statuses
		let memberDesc = '';
		if (client.options.intents.has(GatewayIntentBits.GuildPresences)) {
			memberDesc = client.languageManager.translate(guild, 'guild/server-info:MEMBER_DESC', {
				ONLINE: member.filter(m => m.presence?.status === 'online').size, IDLE: member.filter(m => m.presence?.status === 'idle').size, DND: member.filter(m => m.presence?.status === 'dnd').size, HUMANS: member.filter(m => !m.user.client).size,
			});
		} else {
			memberDesc = client.languageManager.translate(guild, 'guild/server-info:MEMBER_DESC_NO_INTENT', {
				BOTS: member.filter(m => m.user.client).size, HUMANS: member.filter(m => !m.user.client).size,
			});
		}


		// Send server information

		return new EgglordEmbed(client, guild)
			.setAuthor({ name: client.languageManager.translate(guild, 'guild/server-info:AUTHOR', { NAME: guild.name }), iconURL: guild.iconURL() ?? undefined })
			.setThumbnail(guild.iconURL())
			.addFields(
				{ name: client.languageManager.translate(guild, 'guild/server-info:NAME'), value: `\`${guild.name}\``, inline: true },
				{ name: client.languageManager.translate(guild, 'guild/server-info:OWNER'), value: `\`${await guild.fetchOwner().then(m => m.user.displayName)}\``, inline: true },
				{ name: client.languageManager.translate(guild, 'guild/server-info:ID'), value: `\`${guild.id}\``, inline: true },
				{ name: client.languageManager.translate(guild, 'guild/server-info:CREATED'), value: `\`${moment(guild.createdAt).format('MMMM Do YYYY')}\``, inline: true },
				{ name: client.languageManager.translate(guild, 'guild/server-info:VERIFICATION'), value: `\`${guild.verificationLevel}\``, inline: true },
				{ name: client.languageManager.translate(guild, 'guild/server-info:MEMBER', { NUM: guild.memberCount }), value: memberDesc, inline: true },
				{ name: client.languageManager.translate(guild, 'guild/server-info:FEATURES'), value: `\`${guildFeatures}\``, inline: true },
				{ name: client.languageManager.translate(guild, 'guild/server-info:ROLES', { NUM: guild.roles.cache.size }), value: `${roles.join(', ')}${(roles.length != guild.roles.cache.size) ? '...' : '.'}` },
			)
			.setTimestamp()
			.setFooter({ text: client.languageManager.translate(guild, 'guild/server-info:FOOTER', { USER: user.displayName }) });
	}
}

