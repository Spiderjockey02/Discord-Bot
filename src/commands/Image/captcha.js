// Dependencies
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args, emojis, settings) => {
	// Get user
	const user = bot.GetUser(message, args);

	// send 'waitng' message
	const msg = await message.sendT(settings.Language, 'IMAGE/GENERATING_IMAGE');

	// Try and convert image
	try {
		const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=captcha&username=${user.user.username}&url=${user.user.displayAvatarURL({ format: 'png', size: 512 })}`));
		const json = await res.json();
		// send image
		const embed = new MessageEmbed()
			.setColor(9807270)
			.setImage(json.message);
		message.channel.send(embed);
	} catch(err) {
		// if an error occured
		if (bot.config.debug) bot.logger.error(`${err.message} - command: captcha.`);
		message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 })).then(m => m.delete({ timeout: 10000 }));
	}
	msg.delete();
};

module.exports.config = {
	command: 'captcha',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'captcha',
	category: 'Image',
	description: 'Create a captcha image.',
	usage: '${PREFIX}captcha',
};
