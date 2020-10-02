// Dependencies
const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message) => {
	const res = await fetch('https://nekos.life/api/v2/img/meow').then(info => info.json()).catch(error => {
		// An error occured when looking for account
		bot.logger.error(`${error.message ? error.message : error}`);
		message.delete();
		return;
	});
	const embed = new Discord.MessageEmbed()
		.setImage(res.url);
	message.channel.send(embed);
};

module.exports.config = {
	command: 'cat',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Cat',
	category: 'image',
	description: 'Have a nice picture of a cat.',
	usage: '!cat',
};
