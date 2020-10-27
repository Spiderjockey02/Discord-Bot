// Dependencies
const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args, emojis) => {
	// Get image, defaults to author's avatar
	const file = bot.GetImage(message);
	// send 'waiting' message
	const msg = await message.channel.send('Stickbugging your image.');
	try {
		const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=stickbug&url=${file}`));
		const json = await res.json();
		// send image in embed
		const attachment = new Discord.MessageAttachment(json.message, 'stickbug.mp4');
		message.channel.send(attachment);
	} catch(e) {
		console.log(e);
		// if an error occured
		bot.logger.log(e.message);
		msg.delete();
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 10000 }));
	}
};

module.exports.config = {
	command: 'stickbug',
	aliases: ['stick-bug'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'stickbug',
	category: 'Image',
	description: 'stickbug your avatar',
	usage: '${PREFIX}stickbug [file]',
};
