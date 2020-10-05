// Dependencies
const Discord = require('discord.js');

module.exports.run = async (bot, message) => {
	if (message.guild.icon) {
		const embed = new Discord.MessageEmbed()
			.setDescription(`[Download](${message.guild.iconURL({ dynamic: true, size: 1024 })})`)
			.setImage(message.guild.iconURL({ dynamic: true, size: 1024 }));
		message.channel.send(embed);
	} else {
		message.channel.send({ embed:{ color:15158332, description:`${(message.channel.permissionsFor(bot.user).has('USE_EXTERNAL_EMOJIS')) ? bot.config.emojis.cross : ':negative_squared_cross_mark:'} This server does not have a server icon.` } }).then(m => m.delete({ timeout: 5000 }));
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
	description: 'Get the server\'s icon',
	usage: '${PREFIX}guildicon',
};
