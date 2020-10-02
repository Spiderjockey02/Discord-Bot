// Dependencies
const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args) => {
	// Get user
	const user = (message.mentions.users.first()) ? message.mentions.users.first() : message.author;
	// Get text
	let text = args.join(' ');
	text = text.replace(/<@.?[0-9]*?>/g, '');
	if (!text) return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('phcomment').help.usage}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	try {
		const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=phcomment&username=${user.username}&image=${user.displayAvatarURL({ format: 'png', size: 512 })}&text=${text}`));
		const json = await res.json();
		const attachment = new Discord.MessageAttachment(json.message, 'phcomment.png');
		message.channel.send(attachment);
	} catch(e) {
		console.log(e);
	}
};

module.exports.config = {
	command: 'phcomment',
	aliases: ['ph'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'phcomment',
	category: 'image',
	description: 'Fake pornhub comment',
	usage: '!phcomment {user - optional} [text]',
};
