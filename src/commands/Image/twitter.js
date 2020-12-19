// Dependencies
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args, settings) => {
	// Get user
	const member = bot.getUsers(message, args);
	if (args.join(' ').replace(/<@.?[0-9]*?>/g, '').length == args.length) args.shift();

	// Get text
	let text = args.join(' ');
	text = text.replace(/<@.?[0-9]*?>/g, '');

	// make sure text was entered
	if (args.length == 0) return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('twitter').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));

	// make sure the text isn't longer than 60 characters
	if (text.length >= 61) return message.error(settings.Language, 'IMAGE/TEXT_OVERLOAD', 60).then(m => m.delete({ timeout: 5000 }));

	// send 'waiting' message
	const msg = await message.sendT(settings.Language, 'IMAGE/GENERATING_IMAGE');

	// Try and convert image
	try {
		const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=tweet&username=${member[0].user.username}&text=${text}`));
		const json = await res.json();
		// send image in embed
		const embed = new MessageEmbed()
			.setImage(json.message);
		msg.delete();
		message.channel.send(embed);
	} catch(err) {
		// if error occured
		console.log(err);
		if (bot.config.debug) bot.logger.error(`${err.message} - command: twitter.`);
		msg.delete();
		message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'twitter',
	aliases: ['tweet'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Twitter',
	category: 'Image',
	description: 'Create a fake Twitter tweet.',
	usage: '${PREFIX}twitter [user] <text>',
};
