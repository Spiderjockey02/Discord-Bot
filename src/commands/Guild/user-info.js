// Dependencies
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

module.exports.run = async (bot, message, args) => {
	// Get user
	const user = bot.GetUser(message, args);

	// Get emoji (for status)
	let emoji;
	if (user.presence.status == 'online') {
		emoji = '🟢';
	} else if (user.presence.status == 'idle') {
		emoji = '🟡';
	} else if (user.presence.status == 'offline') {
		emoji = '⚫';
	} else {
		emoji = '🔴';
	}

	// Display user informaion
	const embed = new MessageEmbed()
		.setAuthor(`User info for ${user.user.username}#${user.user.discriminator}`, user.user.displayAvatarURL())
		.setThumbnail(user.user.displayAvatarURL())
		.addField('Nickname:', user.nickname != null ? user.nickname : '-', true)
		.addField('Status', `${emoji} ${user.presence.status}`, true)
		.addField('📋Joined Discord', moment(user.user.createdAt).format('lll'), true)
		.addField('📋Joined Server', moment(user.joinedAt).format('lll'), true)
		.addField(`Roles [${user.roles.cache.size}/${message.guild.roles.cache.size}]`, user.roles.cache.map(roles => roles).join(', '), true)
		.addField('Activity', (user.presence.activities.length >= 1) ? `${user.presence.activities[0].name} - ${(user.presence.activities[0].type == 'CUSTOM_STATUS') ? user.presence.activities[0].state : user.presence.activities[0].details}` : '-', true)
		.setTimestamp()
		.setFooter(`Requested by ${message.author.username}`);
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
