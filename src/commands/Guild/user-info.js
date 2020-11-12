// Dependencies
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

// Emojis for statuses
const emojiList = {
	'online': '🟢',
	'offline': '⚫',
	'idle': '🟡',
	'dnd': '🔴',
};
// ${emojis[member.presence.status]}
module.exports.run = async (bot, message, args, emojis, settings) => {
	// Get user
	const member = bot.GetUser(message, args);

	// send user info
	const embed = new MessageEmbed()
		.setAuthor(`${emojiList[member.presence.status]} ${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL())
		.setColor(3447003)
		.setThumbnail(member.user.displayAvatarURL({ format: 'png', size: 512 }))
		.addField(message.translate(settings.Language, 'GUILD/USER_NICKNAME'), `\`${member.nickname != null ? member.nickname : 'None'}\``, true)
		.addField(message.translate(settings.Language, 'GUILD/USER_GAME'), `\`${(member.presence.activities.length >= 1) ? `${member.presence.activities[0].name} - ${(member.presence.activities[0].type == 'CUSTOM_STATUS') ? member.presence.activities[0].state : member.presence.activities[0].details}` : 'None'}\``, true)
		.addField(message.translate(settings.Language, 'GUILD/USER_ROLES', [member.roles.cache.size, message.guild.roles.cache.size]), member.roles.cache.map(roles => roles).join(', '), true)
		.addField(message.translate(settings.Language, 'GUILD/USER_JOINED'), `${moment(member.joinedAt).format('lll')} \`${moment(member.joinedAt).fromNow()} (${Math.round((new Date() - member.joinedAt) / 86400000)} day(s) ago)\``)
		.addField(message.translate(settings.Language, 'GUILD/USER_REGISTERED'), `${moment(member.user.createdAt).format('lll')} \`${moment(member.user.createdAt).fromNow()} (${Math.round((new Date() - member.user.createdAt) / 86400000)} day(s) ago)\``)
		.addField(message.translate(settings.Language, 'GUILD/USER_PERMISSIONS', member.permissions.toArray().length), member.permissions.toArray().toString().toLowerCase().replace(/_/g, ' ').replace(/,/g, ' » '))
		.setTimestamp()
		.setFooter(message.translate(settings.Language, 'GUILD/INFO_FOOTER', message.author.tag));
	message.channel.send(embed);
};

module.exports.config = {
	command: 'user-info',
	aliases: ['userinfo', 'whois'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'User info',
	category: 'Guild',
	description: 'Get information on a user.',
	usage: '${PREFIX}user-info [user]',
};
