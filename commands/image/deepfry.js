// Dependencies
const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message) => {
	// Get user
	const user = (message.mentions.users.first()) ? message.mentions.users.first() : message.author;
	// get file for deepfry
	let file;
	if (user == message.author) {
		// Maybe they have uploaded a photo to deepfry
		if (message.attachments.size > 0) {
			const url = message.attachments.first().url;
			if (url.indexOf('png') !== -1 || url.indexOf('jpeg') !== -1 || url.indexOf('tiff') !== -1) {
				file = url;
			} else {
				return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} That file format is not currently supported.` } }).then(m => m.delete({ timeout: 10000 }));
			}
		} else {
			file = user.displayAvatarURL();
		}
	} else {
		file = user.displayAvatarURL();
	}
	// send 'waiting' message
	const msg = await message.channel.send('Deepfrying your image.');
	try {
		const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=deepfry&image=${file}`));
		const json = await res.json();
		// send image in embed
		const embed = new Discord.MessageEmbed()
			.setImage(json.message);
		msg.delete();
		message.channel.send(embed);
	} catch(e) {
		// if an error occured
		bot.logger.log(e.message);
		msg.delete();
		message.channel.send('An error has occured when running this command.').then(m => m.delete({ timeout:3500 }));
	}
};

module.exports.config = {
	command: 'deepfry',
	aliases: ['deep-fry'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'deepfry',
	category: 'image',
	description: 'Deepfry an image. Defaults to user\'s avatar',
	usage: '!deepfry [file - optional]',
};
