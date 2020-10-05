// Dependencies
const Discord = require('discord.js');
const fetch = require('node-fetch');
const fileTypes = ['png', 'jpeg', 'tiff', 'jpg'];

module.exports.run = async (bot, message) => {
	// Get the right emoji (just in case bot dosen't have external emoji permission)
	const emoji = (message.channel.permissionsFor(bot.user).has('USE_EXTERNAL_EMOJIS')) ? bot.config.emojis.cross : ':negative_squared_cross_mark:';
	// Get user
	const user = (message.mentions.users.first()) ? message.mentions.users.first() : message.author;
	// get file for deepfry
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
		message.channel.send({ embed:{ color:15158332, description:`${emoji} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 10000 }));
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
	usage: '${PREFIX}deepfry [file]',
};
