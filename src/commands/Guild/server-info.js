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
	async run(bot, message) {
		// Sort roles by position
		const roles = message.guild.roles.cache.sort((a, b) => b.position - a.position).array();
		while (roles.join(', ').length >= 1021) {
			roles.pop();
		}

		// Send server information
		const member = message.guild.members.cache;
		const embed = new Embed(message)
			.setAuthor(message.translate('guild/server-info:AUTHOR', { NAME: message.guild.name }), message.guild.iconURL())
			.setColor(3447003)
			.setThumbnail(message.guild.iconURL())
			.addField(message.translate('guild/server-info:NAME'), `\`${message.guild.name}\``, true)
			.addField(message.translate('guild/server-info:OWNER'), `\`${message.guild.owner.user.tag}\``, true)
			.addField(message.translate('guild/server-info:ID'), `\`${message.guild.id}\``, true)
			.addField(message.translate('guild/server-info:CREATED'), `\`${moment(message.guild.createdAt).format('MMMM Do YYYY')}\``, true)
			.addField(message.translate('guild/server-info:REGION'), `\`${message.guild.region}\``, true)
			.addField(message.translate('guild/server-info:VERIFICATION'), `\`${message.guild.verificationLevel}\``, true)
			.addField(message.translate('guild/server-info:MEMBER', { NUM: message.guild.memberCount }), message.translate('guild/server-info:MEMBER_DESC', {
				ONLINE: member.filter(m => m.presence.status === 'online').size, IDLE: member.filter(m => m.presence.status === 'idle').size, DND: member.filter(m => m.presence.status === 'dnd').size, BOTS: member.filter(m => m.user.bot).size, HUMANS: member.filter(m => !m.user.bot).size,
			}), true)
			.addField(message.translate('guild/server-info:FEATURES'), `\`${(message.guild.features.length == 0) ? message.translate('misc:NONE') : message.guild.features.toString().toLowerCase().replace(/,/g, ', ')}\``, true)
			.addField(message.translate('guild/server-info:ROLES', { NUM: message.guild.roles.cache.size }), `${roles.join(', ')}${(roles.length != message.guild.roles.cache.sort((a, b) => b.position - a.position).array().length) ? '...' : '.'}`)
			.setTimestamp()
			.setFooter('guild/server-info:FOOTER', { USER: message.author.tag });
		message.channel.send(embed);
	}
};
