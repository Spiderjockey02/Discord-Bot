// Dependencies
const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message) => {
	const res = await fetch('https://nekos.life/api/v2/img/woof').then(info => info.json()).catch(err => {
		// An error occured when looking for account
		bot.logger.error(`${err.message}`);
		message.delete();
		return;
	});
	const embed = new Discord.MessageEmbed()
		.setImage(res.url);
	message.channel.send(embed);
};

module.exports.config = {
	command: 'dog',
	aliases: ['woof'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Dog',
	category: 'image',
	description: 'Have a nice picture of a dog.',
	usage: '${PREFIX}dog',
};
