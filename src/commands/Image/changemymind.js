// Dependencies
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args, settings) => {
	// Get text
	const text = args.join(' ');

	// make sure text was entered
	if (!text) return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('changemymind').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));

	// make sure the text isn't longer than 80 characters
	if (text.length >= 81) return message.error(settings.Language, 'IMAGE/TEXT_OVERLOAD', 80).then(m => m.delete({ timeout: 5000 }));

	// send 'waiting' message
	const msg = await message.sendT(settings.Language, 'IMAGE/GENERATING_IMAGE');

	// Try and convert image
	try {
		const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=changemymind&text=${text}`));
		const json = await res.json();
		// send image
		const embed = new MessageEmbed()
			.setColor(2067276)
			.setImage(json.message);
		msg.delete();
		message.channel.send(embed);
	} catch(err) {
		// if an error occured
		if (bot.config.debug) bot.logger.error(`${err.message} - command: changemymind.`);
		msg.delete();
		message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'changemymind',
	aliases: ['cmm'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'changemymind',
	category: 'Image',
	description: 'Create a change my mind image.',
	usage: '${PREFIX}changemymind <text>',
};
