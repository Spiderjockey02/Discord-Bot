// Dependencies
const Discord = require('discord.js');

module.exports.run = async (bot, message) => {
	// Get avatar image of user
	const user = (message.mentions.users.first()) ? message.mentions.users.first() : message.author;
	const member = message.guild.member(user);

	const embed = new Discord.MessageEmbed()
		.setTitle(`Avatar for ${member.user.username}#${member.user.discriminator}`)
		.setDescription(`**Link:**\n[png](${message.author.displayAvatarURL({ format: 'png', size: 1024 })}) | [jpg](${message.author.displayAvatarURL({ format: 'jpg', size: 1024 })}) | [gif](${message.author.displayAvatarURL({ format: 'gif', size: 1024, dynamic: true })}) | [webp](${message.author.displayAvatarURL({ format: 'webp', size: 1024 })})`)
		.setImage(`${member.user.displayAvatarURL()}?size=1024`);
	message.channel.send(embed);
};

module.exports.config = {
	command: 'avatar',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Avatar',
	category: 'Guild',
	description: 'Get user\'s avatar',
	usage: '!avatar [user]',
};
