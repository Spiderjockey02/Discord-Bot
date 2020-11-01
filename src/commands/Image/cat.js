// Dependencies
const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args, emojis) => {
	const res = await fetch('https://nekos.life/api/v2/img/meow').then(info => info.json()).catch(err => {
		// An error occured when looking for account
		if (bot.config.debug) bot.logger.error(`${err.message} - command: cat.`);
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 5000 }));
		message.delete();
		return;
	});
	const embed = new Discord.MessageEmbed()
		.setImage(res.url);
	message.channel.send(embed);
};

module.exports.config = {
	command: 'cat',
	aliases: ['meow'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Cat',
	category: 'Image',
	description: 'Have a nice picture of a cat.',
	usage: '${PREFIX}cat',
};
