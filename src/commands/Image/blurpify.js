// Dependencies
const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args, emojis) => {
	// Get image, defaults to author's avatar
	const file = bot.GetImage(message, emojis);
	// send 'waiting' message
	const msg = await message.channel.send('Blupifing your image.');
	try {
		const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=blurpify&image=${file[0]}`));
		const json = await res.json();
		// send image in embed
		const embed = new Discord.MessageEmbed()
			.setImage(json.message);
		message.channel.send(embed);
		// delete loading message
		msg.delete();
	} catch(err) {
		// if an error occured
		msg.delete();
		bot.logger.log(err.message);
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 10000 }));
	}
};

module.exports.config = {
	command: 'blurpify',
	aliases: ['blurp'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'blurpify',
	category: 'Image',
	description: 'Blurpify your avatar.',
	usage: '${PREFIX}blurpify [file]',
};
