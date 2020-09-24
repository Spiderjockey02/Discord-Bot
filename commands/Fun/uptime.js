// Dependencies
const Discord = require('discord.js');

// Convert number to string
function duration(ms) {
	const sec = Math.floor((ms / 1000) % 60).toString();
	const min = Math.floor((ms / (1000 * 60)) % 60).toString();
	const hrs = Math.floor((ms / (1000 * 60 * 60)) % 60).toString();
	const days = Math.floor((ms / (1000 * 60 * 60 * 24)) % 60).toString();
	return `${days.padStart(1, '0')} days ${hrs.padStart(2, '0')} hours ${min.padStart(2, '0')} minutes ${sec.padStart(2, '0')} seconds`;
}

module.exports.run = async (bot, message) => {
	const embed = new Discord.MessageEmbed()
		.setDescription(`I have been alive for ${duration(bot.uptime)}.`);
	message.channel.send(embed);
};

module.exports.config = {
	command: 'uptime',
	aliases: ['uptime'],
};

module.exports.help = {
	name: 'Uptime',
	category: 'Fun',
	description: 'Shows how long the bot has been online for',
	usage: '!uptime',
};
