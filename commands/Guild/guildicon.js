// Dependencies
const Discord = require('discord.js');

module.exports.run = async (bot, message) => {
	if (message.guild.icon) {
		const embed = new Discord.MessageEmbed()
			.setDescription(`[Download](${message.guild.iconURL({ dynamic: true, size: 1024 })})`)
			.setImage(message.guild.iconURL({ dynamic: true, size: 1024 }));
		message.channel.send(embed);
	} else {
		message.channel.send('This server does not have a server icon.').then(m => m.delete({ timeout:3500 }));
	}
};

module.exports.config = {
	command: 'guildicon',
	aliases: ['guildavatar', 'servericon', 'serveravatar'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Guildicon',
	category: 'Guild',
	description: 'Get the server\'s icon',
	usage: '!guildicon [user]',
};
