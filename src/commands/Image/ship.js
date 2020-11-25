// Dependencies
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args, settings) => {
	// Get user
	const user1 = bot.GetImage(message, args, settings.Language);
	if (!user1) return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('phcomment').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
	const user2 = (args[1]) ? message.mentions.users.array()[1] : message.author;
	console.log(user1);
	// send 'waitng' message

	const msg = await message.sendT(settings.Language, 'IMAGE/GENERATING_IMAGE');

	// Try and convert image
	try {
		const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=ship&user1=${user1[0]}&user2=${user2.displayAvatarURL({ format: 'png', size: 512 })}`));
		const json = await res.json();
		// send image
		const embed = new MessageEmbed()
			.setImage(json.message);
		msg.delete();
		message.channel.send(embed);
	} catch(err) {
		// if an error occured
		if (bot.config.debug) bot.logger.error(`${err.message} - command: ship.`);
		msg.delete();
		message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'ship',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'ship',
	category: 'Image',
	description: 'Create a ship image.',
	usage: '${PREFIX}ship <user1> [user2]',
};
