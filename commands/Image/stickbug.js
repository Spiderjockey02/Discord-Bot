// Dependencies
const Discord = require('discord.js');
const fetch = require('node-fetch');
const fileTypes = ['png', 'jpeg', 'tiff', 'jpg'];

module.exports.run = async (bot, message, args, emoji) => {
	// Get user
	const user = (message.mentions.users.first()) ? message.mentions.users.first() : message.author;
	// Get file for stickbug
	let file;
	if (user == message.author) {
		// Maybe they have uploaded a photo to deepfry
		if (message.attachments.size > 0) {
			const url = message.attachments.first().url;
			for (let i = 0; i < fileTypes.length; i++) {
				if (url.indexOf(fileTypes[i]) !== -1) {
					file = url;
				}
			}
			// no file with the correct format was found
			if (!file) return message.channel.send({ embed:{ color:15158332, description:`${emoji} That file format is not currently supported.` } }).then(m => m.delete({ timeout: 10000 }));
		} else {
			file = user.displayAvatarURL();
		}
	} else {
		file = user.displayAvatarURL();
	}
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
		message.channel.send({ embed:{ color:15158332, description:`${emoji} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 10000 }));
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
