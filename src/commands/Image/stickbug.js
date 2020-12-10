// Dependencies
const { MessageAttachment } = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args, settings) => {
	// Get image, defaults to author's avatar
	const file = bot.GetImage(message, args, settings.Language);

	// send 'waiting' message
	const msg = await message.sendT(settings.Language, 'IMAGE/GENERATING_IMAGE');

	// Try and convert image
	try {
		const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=stickbug&url=${file[0]}`));
		const json = await res.json();
		// send image in embed
		const attachment = new MessageAttachment(json.message, 'stickbug.mp4');
		message.channel.send(attachment);
		msg.delete();
	} catch(err) {
		// if an error occured
		if (bot.config.debug) bot.logger.error(`${err.message} - command: stickbug.`);
		msg.delete();
		message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'stickbug',
	aliases: ['stick-bug'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'stickbug',
	category: 'Image',
	description: 'Create a stickbug meme.',
	usage: '${PREFIX}stickbug [file]',
};
