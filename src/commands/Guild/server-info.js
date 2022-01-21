// Dependencies
const { Embed } = require('../../utils'),
	moment = require('moment'),
	Command = require('../../structures/Command.js');

/**
 * Server-info command
 * @extends {Command}
*/
class ServerInfo extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor(bot) {
		super(bot, {
			name:  'server-info',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['serverinfo', 'guildinfo'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Get information on the server.',
			usage: 'server-info',
			cooldown: 2000,
			slash: true,
		});
	}

	/**
	 * Function for recieving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(bot, message) {
		// Sort roles by position
		const embed = await this.createEmbed(bot, message.guild, message.author);
		message.channel.send({ embeds: [embed] });
	}

	/**
 	 * Function for recieving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
 	 * @readonly
	*/
	async callback(bot, interaction, guild) {
		const user = interaction.member.user;

		// send embed
		const embed = await this.createEmbed(bot, guild, user);
		interaction.reply({ embeds: [embed] });
	}

	/**
	 * Function for creating embed of server information.
	 * @param {bot} bot The instantiating client
	 * @param {guild} Guild The guild the command was ran in
	 * @param {user} User The user for embed#footer
	 * @returns {embed}
	*/
	async createEmbed(bot, guild, user) {
		const roles = [...guild.roles.cache.sort((a, b) => b.position - a.position).values()];
		while (roles.join(', ').length >= 1021) {
			roles.pop();
		}

		// Send server information
		const member = guild.members.cache;
		return new Embed(bot, guild)
			.setAuthor({ name: guild.translate('guild/server-info:AUTHOR', { NAME: guild.name }), iconURL: guild.iconURL() })
			.setColor(3447003)
			.setThumbnail(guild.iconURL())
			.addFields(
				{ name: guild.translate('guild/server-info:NAME'), value: `\`${guild.name}\``, inline: true },
				{ name: guild.translate('guild/server-info:OWNER'), value: `\`${await guild.fetchOwner().then(m => m.user.tag)}\``, inline: true },
				{ name: guild.translate('guild/server-info:ID'), value: `\`${guild.id}\``, inline: true },
				{ name: guild.translate('guild/server-info:CREATED'), value: `\`${moment(guild.createdAt).format('MMMM Do YYYY')}\``, inline: true },
				{ name: guild.translate('guild/server-info:REGION'), value: `\`${guild.region}\``, inline: true },
				{ name: guild.translate('guild/server-info:VERIFICATION'), value: `\`${guild.verificationLevel}\``, inline: true },
				{ name: guild.translate('guild/server-info:MEMBER', { NUM: guild.memberCount }), value: guild.translate('guild/server-info:MEMBER_DESC', {
					ONLINE: member.filter(m => m.presence?.status === 'online').size.toLocaleString(guild.settings.Language), IDLE: member.filter(m => m.presence?.status === 'idle').size.toLocaleString(guild.settings.Language), DND: member.filter(m => m.presence?.status === 'dnd').size.toLocaleString(guild.settings.Language), BOTS: member.filter(m => m.user.bot).size.toLocaleString(guild.settings.Language), HUMANS: member.filter(m => !m.user.bot).size.toLocaleString(guild.settings.Language),
				}), inline: true },
				{ name: guild.translate('guild/server-info:FEATURES'), value: `\`${(guild.features.length == 0) ? guild.translate('misc:NONE') : guild.features.toString().toLowerCase().replace(/,/g, ', ')}\``, inline: true },
				{ name: guild.translate('guild/server-info:ROLES', { NUM: guild.roles.cache.size }), value: `${roles.join(', ')}${(roles.length != guild.roles.cache.size) ? '...' : '.'}` },
			)
			.setTimestamp()
			.setFooter({ text: guild.translate('guild/server-info:FOOTER', { USER: user.tag }) });
	}
}

module.exports = ServerInfo;
