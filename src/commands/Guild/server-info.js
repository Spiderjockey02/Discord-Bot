// Dependencies
const { Embed } = require('../../utils'),
	moment = require('moment'),
	Command = require('../../structures/Command.js');

module.exports = class ServerInfo extends Command {
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
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Sort roles by position
		const roles = message.guild.roles.cache.sort((a, b) => b.position - a.position).array();
		while (roles.join(', ').length >= 1021) {
			roles.pop();
		}

		// Send server information
		const member = message.guild.members.cache;
		const embed = new Embed(bot, message.guild)
			.setAuthor(message.translate('guild/server-info:AUTHOR', { NAME: message.guild.name }), message.guild.iconURL())
			.setColor(3447003)
			.setThumbnail(message.guild.iconURL())
			.addFields(
				{ name: message.translate('guild/server-info:NAME'), value: `\`${message.guild.name}\``, inline: true },
				{ name: message.translate('guild/server-info:OWNER'), value: `\`${message.guild.owner.user.tag}\``, inline: true },
				{ name: message.translate('guild/server-info:ID'), value: `\`${message.guild.id}\``, inline: true },
				{ name: message.translate('guild/server-info:CREATED'), value: `\`${moment(message.guild.createdAt).format('MMMM Do YYYY')}\``, inline: true },
				{ name: message.translate('guild/server-info:REGION'), value: `\`${message.guild.region}\``, inline: true },
				{ name: message.translate('guild/server-info:VERIFICATION'), value: `\`${message.guild.verificationLevel}\``, inline: true },
				{ name: message.translate('guild/server-info:MEMBER', { NUM: message.guild.memberCount }), value: message.translate('guild/server-info:MEMBER_DESC', {
					ONLINE: member.filter(m => m.presence.status === 'online').size.toLocaleString(settings.Language), IDLE: member.filter(m => m.presence.status === 'idle').size.toLocaleString(settings.Language), DND: member.filter(m => m.presence.status === 'dnd').size.toLocaleString(settings.Language), BOTS: member.filter(m => m.user.bot).size.toLocaleString(settings.Language), HUMANS: member.filter(m => !m.user.bot).size.toLocaleString(settings.Language),
				}), inline: true },
				{ name: message.translate('guild/server-info:FEATURES'), value: `\`${(message.guild.features.length == 0) ? message.translate('misc:NONE') : message.guild.features.toString().toLowerCase().replace(/,/g, ', ')}\``, inline: true },
				{ name: message.translate('guild/server-info:ROLES', { NUM: message.guild.roles.cache.size }), value: `${roles.join(', ')}${(roles.length != message.guild.roles.cache.sort((a, b) => b.position - a.position).array().length) ? '...' : '.'}` },
			)
			.setTimestamp()
			.setFooter('guild/server-info:FOOTER', { USER: message.author.tag });
		message.channel.send(embed);
	}
};
