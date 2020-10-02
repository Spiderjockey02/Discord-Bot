// Dependencies
const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args) => {
	// Get user
	const user = (message.mentions.users.first()) ? message.mentions.users.first() : message.author;
	// Get text
	const text = args.join(' ');
	if (!text) return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('twitter').help.usage}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	try {
		const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=clyde&text=${text}`));
		const json = await res.json();
		const attachment = new Discord.MessageAttachment(json.message, 'tweet.png');
		message.channel.send(attachment);
	} catch(e) {
		console.log(e);
	}
};

module.exports.config = {
	command: 'clyde',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Clyde',
	category: 'image',
	description: 'Fake clyde message',
	usage: '!clyde [text]',
};
