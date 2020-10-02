// Dependencies
const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message) => {
	// Get user
	const user = (message.mentions.users.first()) ? message.mentions.users.first() : message.author;
	try {
		const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=captcha&username=${user.username}&url=${user.displayAvatarURL({ format: 'png', size: 512 })}`));
		const json = await res.json();
		const attachment = new Discord.MessageAttachment(json.message, 'tweet.png');
		message.channel.send(attachment);
	} catch(e) {
		console.log(e);
	}
};

module.exports.config = {
	command: 'captcha',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'captcha',
	category: 'image',
	description: 'Create a captcha image.',
	usage: '!captcha',
};
