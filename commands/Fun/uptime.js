// Dependencies
const Discord = require('discord.js');
const moment = require('moment');

module.exports.run = async (bot, message) => {
	const embed = new Discord.MessageEmbed()
		.setDescription(`I have been alive for ${moment.duration(bot.uptime).format(' D [days], H [hrs], m [mins], s [secs]')}.`);
	message.channel.send(embed);
};

module.exports.config = {
	command: 'uptime',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Uptime',
	category: 'Fun',
	description: 'Shows how long the bot has been online for.',
	usage: '${prefix}uptime',
};
