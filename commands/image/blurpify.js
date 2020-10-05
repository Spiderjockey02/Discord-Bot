// Dependencies
const Discord = require('discord.js');
const fetch = require('node-fetch');
const fileTypes = ['png', 'jpeg', 'tiff', 'jpg'];

module.exports.run = async (bot, message, args, emoji) => {
	// Get user
	const user = (message.mentions.users.first()) ? message.mentions.users.first() : message.author;
	// Get file for blurpify
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
	const msg = await message.channel.send('Blupifing your image.');
	try {
		const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=blurpify&image=${file}`));
		const json = await res.json();
		// send image in embed
		const embed = new Discord.MessageEmbed()
			.setImage(json.message);
		msg.delete();
		message.channel.send(embed);
	} catch(err) {
		// if an error occured
		bot.logger.log(err.message);
		msg.delete();
		message.channel.send({ embed:{ color:15158332, description:`${emoji} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 10000 }));
	}
};

module.exports.config = {
	command: 'blurpify',
	aliases: ['blurp'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'blurpify',
	category: 'image',
	description: 'blurpify your avatar',
	usage: '${prefix}blurpify [file]',
};
