// Dependencies
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args, settings) => {
	// Get text
	const text = args.join(' ');

	// make sure text was entered
	if (!text) return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('clyde').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));

	// make sure the text isn't longer than 70 characters
	if (text.length >= 71) return message.error(settings.Language, 'IMAGE/TEXT_OVERLOAD', 70).then(m => m.delete({ timeout: 5000 }));

	// send 'waiting' message
	const msg = await message.sendT(settings.Language, 'IMAGE/GENERATING_IMAGE');
	try {
		const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=clyde&text=${text}`));
		const json = await res.json();
		// send image
		const embed = new MessageEmbed()
			.setColor(3447003)
			.setImage(json.message);
		msg.delete();
		message.channel.send(embed);
	} catch(err) {
		// if an error occured
		if (bot.config.debug) bot.logger.error(`${err.message} - command: clyde.`);
		msg.delete();
		message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'clyde',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Clyde',
	category: 'Image',
	description: 'Create a fake Clyde message.',
	usage: '${PREFIX}clyde <text>',
};
