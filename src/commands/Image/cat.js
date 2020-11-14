// Dependencies
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args, settings) => {
	const res = await fetch('https://nekos.life/api/v2/img/meow').then(info => info.json()).catch(err => {
		// An error occured when looking for image
		if (bot.config.debug) bot.logger.error(`${err.message} - command: cat.`);
		message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		message.delete();
		return;
	});

	// send image
	const embed = new MessageEmbed()
		.setColor(3426654)
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
