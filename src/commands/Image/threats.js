// Dependencies
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args, emojis) => {
	// Get image, defaults to author's avatar
	const file = bot.GetImage(message, emojis);
	// send 'waiting' message
	const msg = await message.channel.send('Creating threat image');
	try {
		const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=threats&url=${file[0]}`));
		const json = await res.json();
		// send image in embed
		const embed = new MessageEmbed()
			.setImage(json.message);
		msg.delete();
		message.channel.send(embed);
	} catch(err) {
		// if an error occured
		if (bot.config.debug) bot.logger.error(`${err.message} - command: threats.`);
		msg.delete();
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 10000 }));
	}
};

module.exports.config = {
	command: 'threats',
	aliases: ['blurp'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'threats',
	category: 'Image',
	description: 'Creates a threat meme.',
	usage: '${PREFIX}threats [image]',
};
