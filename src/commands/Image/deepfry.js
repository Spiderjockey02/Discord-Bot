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
		const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=deepfry&image=${file[0]}`));
		const json = await res.json();
		// send image
		const embed = new MessageEmbed()
			.setColor(15105570)
			.setImage(json.message);
		msg.delete();
		message.channel.send(embed);
	} catch(err) {
		// if an error occured
		if (bot.config.debug) bot.logger.error(`${err.message} - command: deepfry.`);
		msg.delete();
		message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'deepfry',
	aliases: ['deep-fry'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'deepfry',
	category: 'Image',
	description: 'Deepfry an image.',
	usage: '${PREFIX}deepfry [file]',
};
