// Dependencies
const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args, emoji, settings) => {
	// Get user
	const user = (message.mentions.users.first()) ? message.mentions.users.first().username : `${args[0]}`;
	// Get text
	args.shift();
	let text = args.join(' ');
	text = text.replace(/<@.?[0-9]*?>/g, '');
	// make sure text was entered
	if (!text) return message.channel.send({ embed:{ color:15158332, description:`${emoji} Please use the format \`${bot.commands.get('twitter').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	// make sure the text isn't longer than 60 characters
	if (text.length >= 61) return message.channel.send({ embed:{ color:15158332, description:`${emoji} Your message must not be more than 60 characters.` } }).then(m => m.delete({ timeout: 5000 }));
	const msg = await message.channel.send('Creating fake twitter image.');
	try {
		const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=tweet&username=${user}&text=${text}`));
		const json = await res.json();
		// send image in embed
		const embed = new Discord.MessageEmbed()
			.setImage(json.message);
		msg.delete();
		message.channel.send(embed);
	} catch(e) {
		// if error occured
		bot.logger.log(e.message);
		msg.delete();
		message.channel.send({ embed:{ color:15158332, description:`${emoji} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 10000 }));
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
	description: 'Fake twitter account',
	usage: '${PREFIX}twitter <user> <text>',
};
