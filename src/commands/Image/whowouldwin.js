// Dependencies
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args, settings) => {
	// Get user
	const user = bot.getUsers(message, args);

	// send 'waitng' message
	const msg = await message.sendT(settings.Language, 'IMAGE/GENERATING_IMAGE');

	// Try and convert image
	try {
		const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=whowouldwin&user1=${user[0].user.displayAvatarURL({ format: 'png', size: 512 })}&user2=${user[1].user.displayAvatarURL({ format: 'png', size: 512 })}`));
		const json = await res.json();
		// send image in embed
		const embed = new MessageEmbed()
			.setImage(json.message);
		msg.delete();
		message.channel.send(embed);
	} catch(err) {
		// if an error occured
		if (bot.config.debug) bot.logger.error(`${err.message} - command: whowouldwin.`);
		msg.delete();
		message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'whowouldwin',
	aliases: ['www'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'whowouldwin',
	category: 'Image',
	description: 'Create a whowouldwin image.',
	usage: '${PREFIX}whowouldwin <user1> [user2]',
};
