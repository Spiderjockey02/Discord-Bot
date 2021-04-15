// Dependencies
const { MessageEmbed } = require('discord.js'),
	moment = require('moment'),
	Command = require('../../structures/Command.js');

module.exports = class ServerInfo extends Command {
	constructor(bot) {
		super(bot, {
			name:  'serverinfo',
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
		const embed = new MessageEmbed()
			.setAuthor(`${message.guild.name}'s server info`, message.guild.iconURL())
			.setColor(3447003)
			.setThumbnail(message.guild.iconURL())
			.addField(bot.translate(settings.Language, 'GUILD/GUILD_NAME'), `\`${message.guild.name}\``, true)
			.addField(bot.translate(settings.Language, 'GUILD/GUILD_OWNER'), `\`${message.guild.owner.user.tag}\``, true)
			.addField(bot.translate(settings.Language, 'GUILD/GUILD_ID'), `\`${message.guild.id}\``, true)
			.addField(bot.translate(settings.Language, 'GUILD/GUILD_CREATED'), `\`${moment(message.guild.createdAt).format('MMMM Do YYYY')}\``, true)
			.addField(bot.translate(settings.Language, 'GUILD/GUILD_REGION'), `\`${message.guild.region}\``, true)
			.addField(bot.translate(settings.Language, 'GUILD/GUILD_VERIFICATION'), `\`${message.guild.verificationLevel}\``, true)
			.addField(bot.translate(settings.Language, 'GUILD/GUILD_MEMBER', message.guild.memberCount), `\`${(member.filter(m => m.presence.status === 'online').size)} online, ${(member.filter(m => m.presence.status === 'idle').size)} idle and ${(member.filter(m => m.presence.status === 'dnd').size)} DnD \n${member.filter(m => m.user.bot).size} bots, ${member.filter(m => !m.user.bot).size} humans\``, true)
			.addField(bot.translate(settings.Language, 'GUILD/GUILD_FEATURES'), `\`${(message.guild.features.length == 0) ? 'None' : message.guild.features.toString().toLowerCase().replace(/,/g, ', ')}\``, true)
			.addField(bot.translate(settings.Language, 'GUILD/GUILD_ROLES', message.guild.roles.cache.size), `${roles.join(', ')}${(roles.length != message.guild.roles.cache.sort((a, b) => b.position - a.position).array().length) ? '...' : '.'}`)
			.setTimestamp()
			.setFooter(bot.translate(settings.Language, 'GUILD/INFO_FOOTER', message.author.tag));
		message.channel.send(embed);
	}
};
