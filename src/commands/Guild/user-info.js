// Dependencies
const { Embed } = require('../../utils'),
	moment = require('moment'),
	{ ApplicationCommandOptionType, GuildMember } = require('discord.js'),
	{ ChannelType } = require('discord-api-types/v10'),
	Command = require('../../structures/Command.js');

/**
 * User-info command
 * @extends {Command}
*/
class UserInfo extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor(bot) {
		super(bot, {
			name:  'user-info',
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
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command.
 	 * @readonly
	*/
	async run(bot, message) {
		// Get user
		const members = await message.getMember();
		const embed = this.createEmbed(bot, message.guild, members[0]);

		// send user info
		message.channel.send({ embeds: [embed] });
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
		const member = guild.members.cache.get(args.get('user')?.value ?? interaction.user.id);

		// send embed
		const embed = await this.createEmbed(bot, guild, member);
		interaction.reply({ embeds: [embed] });
	}

	/**
	 * Function for receiving slash command.
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
	 * @readonly
	*/
	reply(bot, interaction, channel, userID) {
		const guild = bot.channels.cache.get(interaction.guildId);

		let member;
		if (channel.type == ChannelType.DM) {
			member = new GuildMember(bot, { user: bot.users.cache.get(userID) });
		} else {
			member = guild.members.cache.get(userID);
		}

		// send embed
		const embed = this.createEmbed(bot, false, member);
		return interaction.reply({ embeds: [embed] });
	}

	/**
	 * Function for creating embed of user information
	 * @param {bot} bot The instantiating client
	 * @param {guild} Guild The guild the command was ran in
	 * @param {user} GuildMember The member to get information of
	 * @returns {embed}
	*/
	createEmbed(bot, guild, member) {
		const roles = [...member.roles.cache.sort((a, b) => b.position - a.position).values()];
		while (roles.join(', ').length >= 1021) {
			roles.pop();
		}

		// Check if user has status
		let status = 'None';
		if (member.guild) {
			status = (member.presence?.activities.length >= 1) ? `${member.presence.activities[0].name} - ${(member.presence.activities[0].type == 'CUSTOM_STATUS') ? member.presence.activities[0].state : member.presence.activities[0].details}` : 'None';
		}

		const embed = new Embed(bot, guild)
			.setAuthor({ name: member.user.displayName, iconURL: member.user.displayAvatarURL() })
			.setColor(3447003)
			.setThumbnail(member.user.displayAvatarURL({ format: 'png', size: 512 }))
			.addFields(
				{ name: bot.translate('guild/user-info:USERNAME', {}, guild.settings?.Language), value: member.user.displayName, inline: true },
				{ name: bot.translate('guild/user-info:DISCRIM', {}, guild.settings?.Language), value: `${member.user.discriminator}`, inline: true },
				{ name: bot.translate('guild/user-info:ROBOT', {}, guild.settings?.Language), value: bot.translate(`misc:${member.user.bot ? 'YES' : 'NO'}`, {}, guild.settings?.Language), inline: true },
				{ name: bot.translate('guild/user-info:CREATE', {}, guild.settings?.Language), value: moment(member.user.createdAt).format('lll'), inline: true },
				{ name: bot.translate('guild/user-info:STATUS', {}, guild.settings?.Language), value: `\`${status}\``, inline: true },
			);

		// Guild only values
		if (member.guild) {
			embed.addFields({ name: bot.translate('guild/user-info:ROLE', {}, guild.settings?.Language), value: `${member.roles.highest}`, inline: true },
				{ name: bot.translate('guild/user-info:JOIN', {}, guild.settings?.Language), value: moment(member.joinedAt).format('lll'), inline: true },
				{ name: bot.translate('guild/user-info:NICK', {}, guild.settings?.Language), value: member.nickname != null ? member.nickname : bot.translate('misc:NONE', {}, guild.settings?.Language), inline: true },
				{ name: bot.translate('guild/user-info:ROLES', {}, guild.settings?.Language), value: `${roles.join(', ')}${(roles.length != member.roles.cache.size) ? '...' : '.'}` });
		}
		return embed;
	}
}

module.exports = UserInfo;
