// Dependencies
const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args, emoji) => {
	const res = await fetch('https://nekos.life/api/v2/img/woof').then(info => info.json()).catch(err => {
		// An error occured when looking for account
		// An error occured when looking for account
		bot.logger.error(`${err.message}`);
		message.channel.send({ embed:{ color:15158332, description:`${emoji} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 5000 }));
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
