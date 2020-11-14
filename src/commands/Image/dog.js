// Dependencies
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args, settings) => {
	const res = await fetch('https://nekos.life/api/v2/img/woof').then(info => info.json()).catch(err => {
		// An error occured when looking for image
		bot.logger.error(`${err.message}`);
		message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		message.delete();
		return;
	});

	// send image
	const embed = new MessageEmbed()
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
	category: 'Image',
	description: 'Have a nice picture of a dog.',
	usage: '${PREFIX}dog',
};
