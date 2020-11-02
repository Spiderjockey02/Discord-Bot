// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports.run = async (bot, message, args, emojis) => {
	if (message.guild.icon) {
		const embed = new MessageEmbed()
			.setDescription(`[Download](${message.guild.iconURL({ dynamic: true, size: 1024 })})`)
			.setImage(message.guild.iconURL({ dynamic: true, size: 1024 }));
		message.channel.send(embed);
	} else {
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} This server does not have a server icon.` } }).then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'guildicon',
	aliases: ['servericon'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Guildicon',
	category: 'Guild',
	description: 'Get the server\'s icon.',
	usage: '${PREFIX}guildicon',
};
