// Dependencies
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args, settings) => {
	// Get user
	const user = bot.getUsers(message, args);
	// Get text
	let text = args.join(' ');
	text = text.replace(/<@.?[0-9]*?>/g, '');

	// Make sure text was entered
	if (!text) return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('phcomment').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));

	// make sure the text isn't longer than 70 characters
	if (text.length >= 71) return message.error(settings.Language, 'IMAGE/TEXT_OVERLOAD', 70).then(m => m.delete({ timeout: 5000 }));

	// send 'waiting' message
	const msg = await message.sendT(settings.Language, 'IMAGE/GENERATING_IMAGE');

	// Try and convert image
	try {
		const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=phcomment&username=${user[0].user.username}&image=${user[0].user.displayAvatarURL({ format: 'png', size: 512 })}&text=${text}`));
		const json = await res.json();
		// send image in embed
		const embed = new MessageEmbed()
			.setImage(json.message);
		msg.delete();
		message.channel.send(embed);
	} catch(err) {
		// if error has occured
		if (bot.config.debug) bot.logger.error(`${err.message} - command: phcomment.`);
		msg.delete();
		message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'phcomment',
	aliases: ['ph', 'ph-comment'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'phcomment',
	category: 'Image',
	description: 'Create a fake Pornhub comment.',
	usage: '${PREFIX}phcomment [user] <text>',
};
