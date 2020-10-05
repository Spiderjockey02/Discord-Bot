// Dependencies
const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message) => {
	// Make sure the bot is NSFW
	if (bot.config.NSFWBot == false) return;
	// Make sure the message was sent in a NSFW channel
	const word = (message.channel.nsfw === true || message.channel.type == 'dm') ? 'hneko' : 'neko';
	try {
		const res = await fetch(encodeURI(`https://nekobot.xyz/api/image?type=${word}`));
		const json = await res.json();
		const embed = new Discord.MessageEmbed()
			.setImage(json.message);
		message.channel.send(embed);
	} catch(e) {
		console.log(e);
	}
};

module.exports.config = {
	command: 'neko',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'neko',
	category: 'nsfw',
	description: 'Have a nice picture of a cat.',
	usage: '!neko',
};
