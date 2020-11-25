// Dependencies
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args, settings) => {
	// Get image, defaults to author's avatar
	const file = bot.GetImage(message, args, settings.Language);
	// send 'waiting' message
	const msg = await message.sendT(settings.Language, 'IMAGE/GENERATING_IMAGE');

	// Try and convert image
	try {
		const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=blurpify&image=${file[0]}`));
		const json = await res.json();
		// send image
		const embed = new MessageEmbed()
			.setColor(3447003)
			.setImage(json.message);
		message.channel.send(embed);
	} catch(err) {
		// if an error occured
		if (bot.config.debug) bot.logger.error(`${err.message} - command: blurpify.`);
		message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
	}
	msg.delete();
};

module.exports.config = {
	command: 'blurpify',
	aliases: ['blurp'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'blurpify',
	category: 'Image',
	description: 'Blurpify an image.',
	usage: '${PREFIX}blurpify [file]',
};
