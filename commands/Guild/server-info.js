// Dependencies
const Discord = require('discord.js');

module.exports.run = async (bot, message) => {
	// Get VIP perks
	const VipPerks = (message.guild.features.length == 0) ? 'None' : message.guild.features.toString().toLowerCase().replace(/,/g, ', ');
	// Display server information
	const embed = new Discord.MessageEmbed()
		.setColor(0x0099ff);
	if (message.guild.icon) {
		embed.setThumbnail(message.guild.iconURL());
	}
	embed.addField('Owner:', message.guild.owner.user.tag, true);
	embed.addField('VIP Perks:', VipPerks, true);
	embed.addField('Server Created:', `Created ${message.channel.guild.createdAt.toLocaleDateString('en-US').substr(0, 16)}`, true);
	embed.addField('Total Roles:', message.guild.roles.cache.size, true);
	embed.addField('Members:', `${message.guild.memberCount} members,\n${(message.guild.members.cache.filter(m => m.presence.status === 'online').size) + (message.guild.members.cache.filter(m => m.presence.status === 'idle').size) + (message.guild.members.cache.filter(m => m.presence.status === 'dnd').size)} online\n ${message.guild.members.cache.filter(m => m.user.bot).size} bots, ${message.guild.members.cache.filter(m => !m.user.bot).size} humans`, true);
	embed.addField('Total Channels:', `${message.guild.channels.cache.size} total channels:\n${message.guild.channels.cache.filter(channel => channel.type === 'category').size} categories\n${message.guild.channels.cache.filter(channel => channel.type === 'text').size} text, ${message.guild.channels.cache.filter(channel => channel.type === 'voice').size} voice`, true);
	embed.addField('Boost Level:', message.guild.premiumTier, true);
	embed.addField('Members boosting:', message.guild.premiumSubscriptionCount, true);
	embed.setFooter(`Server Name: ${message.guild.name} | ServerID: ${message.guild.id}`);
	message.channel.send(embed);
};

module.exports.config = {
	command: 'server-info',
	aliases: ['serverinfo', 'guildinfo', 'guild'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Server info',
	category: 'Guild',
	description: 'Gets information on the server',
	usage: '!server-info',
};
