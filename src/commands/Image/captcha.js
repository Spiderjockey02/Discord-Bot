// Dependencies
const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args, emojis) => {
	// Get user
	const user = (message.mentions.users.first()) ? message.mentions.users.first() : message.author;
	// send 'waitng' message
	const msg = await message.channel.send('Creating captcha.');
	try {
		const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=captcha&username=${user.username}&url=${user.displayAvatarURL({ format: 'png', size: 512 })}`));
		const json = await res.json();
		// send image in embed
		const embed = new Discord.MessageEmbed()
			.setImage(json.message);
		msg.delete();
		message.channel.send(embed);
	} catch(err) {
		// if an error occured
		if (bot.config.debug) bot.logger.error(`${err.message} - command: captcha.`);
		msg.delete();
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 10000 }));
	}
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
