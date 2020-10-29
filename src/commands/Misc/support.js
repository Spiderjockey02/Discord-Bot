// Dependencies
const Discord = require('discord.js');

module.exports.run = async (bot, message) => {
	// Send support info to user
	const embed = new Discord.MessageEmbed()
		.setTitle('Egglord Support')
		.setDescription(`**Our Server:**  [Support Server](${bot.config.SupportServer.link})\n **Our website:**  [Website](${bot.config.Dashboard.domain})\n **Git Repo:** [Website](https://github.com/Spiderjockey02/Discord-Bot)`);
	message.channel.send(embed);
};

module.exports.config = {
	command: 'support',
	aliases: ['sup'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'support',
	category: 'Misc',
	description: 'Get support on the bot.',
	usage: '${PREFIX}support',
};
