// Dependencies
const { Embed } = require('../../utils'),
	moment = require('moment'),
	{ ApplicationCommandOptionType, GuildMember } = require('discord.js'),
	{ ChannelType } = require('discord-api-types/v10'), ;
import Command from '../../structures/Command';

/**
 * User-info command
 * @extends {Command}
*/
export default class UserInfo extends Command {
	/**
	 * @param {Client} client The instantiating client
	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
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

	/**
	 * Function for receiving message.
	 * @param {client} client The instantiating client
	 * @param {message} message The message that ran the command.
	 * @readonly
	*/
	async run(client, message) {
		// Get user
		const members = await message.getMember();
		const embed = this.createEmbed(client, message.guild, members[0]);

		// send user info
		message.channel.send({ embeds: [embed] });
	}

	/**
	 * Function for receiving interaction.
	 * @param {client} client The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
	 * @readonly
	*/
	async callback(client, interaction, guild, args) {
		const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id);

		// send embed
		const embed = await this.createEmbed(client, guild, member);
		interaction.reply({ embeds: [embed] });
	}

	/**
	 * Function for receiving slash command.
	 * @param {client} client The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
	 * @readonly
	*/
	reply(client, interaction, channel, userID) {
		const guild = client.channels.cache.get(interaction.guildId);

		let member;
		if (channel.type == ChannelType.DM) {
			member = new GuildMember(client, { user: client.users.cache.get(userID) });
		} else {
			member = guild.members.cache.get(userID);
		}

		// send embed
		const embed = this.createEmbed(client, false, member);
		return interaction.reply({ embeds: [embed] });
	}

	/**
	 * Function for creating embed of user information
	 * @param {client} client The instantiating client
	 * @param {guild} Guild The guild the command was ran in
	 * @param {user} GuildMember The member to get information of
	 * @returns {embed}
	*/
	async createEmbed(client, guild, member) {
		const roles = [...member.roles.cache.sort((a, b) => b.position - a.position).values()];
		const supportGuild = client.guilds.cache.get(client.config.SupportServer.GuildID);
		let isContributor, isSupport, isDev = false;

		try {
			const memberInSupportGuild = await supportGuild.members.fetch(member.user.id);
			if (memberInSupportGuild !== null) {
				isContributor = memberInSupportGuild.roles.cache.some(role => role.id === client.config.Staff.ContributorRole);
				isSupport = memberInSupportGuild.roles.cache.some(role => role.id === client.config.Staff.SupportRole);
				isDev = memberInSupportGuild.roles.cache.some(role => role.id === client.config.Staff.DeveloperRole);
			}
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
		}

		while (roles.join(', ').length >= 1021) {
			roles.pop();
		}

		// Check if user has status
		let status = 'None';
		if (member.guild) {
			status = (member.presence?.activities.length >= 1) ? `${member.presence.activities[0].name} - ${(member.presence.activities[0].type == 'CUSTOM_STATUS') ? member.presence.activities[0].state : member.presence.activities[0].details}` : 'None';
		}

		const embed = new Embed(client, guild)
			.setAuthor({ name: member.user.displayName, iconURL: member.user.displayAvatarURL() })
			.setColor(3447003)
			.setThumbnail(member.user.displayAvatarURL({ format: 'png', size: 512 }))
			.addFields(
				{ name: client.translate('guild/user-info:USERNAME', {}, guild.settings?.Language), value: member.user.displayName, inline: true },
				{ name: client.translate('guild/user-info:DISCRIM', {}, guild.settings?.Language), value: `${member.user.discriminator}`, inline: true },
				{ name: client.translate('guild/user-info:ROclient', {}, guild.settings?.Language), value: client.translate(`misc:${member.user.client ? 'YES' : 'NO'}`, {}, guild.settings?.Language), inline: true },
				{ name: client.translate('guild/user-info:CREATE', {}, guild.settings?.Language), value: moment(member.user.createdAt).format('lll'), inline: true },
				{ name: client.translate('guild/user-info:STATUS', {}, guild.settings?.Language), value: `\`${status}\``, inline: true },
			);

		// Guild only values
		if (member.guild) {
			const role = (roles.length != member.roles.cache.size) ? '...' : '.';
			const nick = member.nickname != null ? member.nickname : client.translate('misc:NONE', {}, guild.settings?.Language);
			embed.addFields({ name: client.translate('guild/user-info:ROLE', {}, guild.settings?.Language), value: `${member.roles.highest}`, inline: true },
				{ name: client.translate('guild/user-info:JOIN', {}, guild.settings?.Language), value: moment(member.joinedAt).format('lll'), inline: true },
				{ name: client.translate('guild/user-info:NICK', {}, guild.settings?.Language), value: nick, inline: true },
				{ name: client.translate('guild/user-info:ROLES', {}, guild.settings?.Language), value: `${roles.join(', ')}${role}` });
		}

		// Staff only vales
		if (isContributor | isSupport | isDev) {
			const contributer = isContributor ? `${supportGuild.roles.cache.find(role => role.id === client.config.Staff.ContributorRole).name}` : '';
			const support = isSupport ? `${supportGuild.roles.cache.find(role => role.id === client.config.Staff.SupportRole).name}` : '';
			const dev = isDev ? `${supportGuild.roles.cache.find(role => role.id === client.config.Staff.DeveloperRole).name}` : '';
			embed.addFields({ name: client.translate('guild/user-info:client', {}, guild.settings?.Language), value: `${contributer} ${support} ${dev}`, inline: true });
		}
		return embed;
	}
}

