const Discord = require('discord.js');
module.exports.run = async (bot, message) => {
	const embed = new Discord.MessageEmbed()
		.setTitle('Egglord Support')
		.setDescription(`**Our Server:**  [Support Server](${bot.config.SupportLink})\n **Our website:**  [Website](${bot.config.Dashboard.domain})`);
	message.channel.send(embed);
};

module.exports.config = {
	command: 'support',
	aliases: ['sup'],
};

module.exports.help = {
	name: 'support',
	category: 'Host',
	description: 'Get information for getting support on Egglord.',
	usage: '!support',
};
