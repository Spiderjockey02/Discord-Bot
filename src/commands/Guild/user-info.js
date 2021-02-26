// Dependencies
const { MessageEmbed } = require('discord.js'),
	moment = require('moment'),
	Command = require('../../structures/Command.js');

// Emojis for statuses
const emojiList = {
	'online': '🟢',
	'offline': '⚫',
	'idle': '🟡',
	'dnd': '🔴',
};

module.exports = class ServerInfo extends Command {
	constructor(bot) {
		super(bot, {
			name:  'user-info',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['userinfo', 'whois'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Get information on the server.',
			usage: 'user-info [user]',
			cooldown: 2000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Get user
		const member = message.guild.getMember(message, args);

		// send user info
		const embed = new MessageEmbed()
			.setAuthor(`${emojiList[member[0].presence.status]} ${member[0].user.tag} (${member[0].user.id})`, member[0].user.displayAvatarURL())
			.setColor(3447003)
			.setThumbnail(member[0].user.displayAvatarURL({ format: 'png', size: 512 }))
			.addField(message.translate(settings.Language, 'GUILD/USER_NICKNAME'), `\`${member[0].nickname != null ? member[0].nickname : 'None'}\``, true)
			.addField(message.translate(settings.Language, 'GUILD/USER_GAME'), `\`${(member[0].presence.activities.length >= 1) ? `${member[0].presence.activities[0].name} - ${(member[0].presence.activities[0].type == 'CUSTOM_STATUS') ? member[0].presence.activities[0].state : member[0].presence.activities[0].details}` : 'None'}\``, true)
			.addField(message.translate(settings.Language, 'GUILD/USER_ROLES', [member[0].roles.cache.size, message.guild.roles.cache.size]), member[0].roles.cache.map(roles => roles).join(', '), true)
			.addField(message.translate(settings.Language, 'GUILD/USER_JOINED'), `${moment(member[0].joinedAt).format('lll')} \`${moment(member[0].joinedAt).fromNow()} (${Math.round((new Date() - member[0].joinedAt) / 86400000)} day(s) ago)\``)
			.addField(message.translate(settings.Language, 'GUILD/USER_REGISTERED'), `${moment(member[0].user.createdAt).format('lll')} \`${moment(member[0].user.createdAt).fromNow()} (${Math.round((new Date() - member[0].user.createdAt) / 86400000)} day(s) ago)\``)
			.addField(message.translate(settings.Language, 'GUILD/USER_PERMISSIONS', member[0].permissions.toArray().length), member[0].permissions.toArray().toString().toLowerCase().replace(/_/g, ' ').replace(/,/g, ' » '))
			.setTimestamp()
			.setFooter(message.translate(settings.Language, 'GUILD/INFO_FOOTER', message.author.tag));
		message.channel.send(embed);
	}
};
