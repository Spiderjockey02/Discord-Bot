// Dependencies
const Discord = require('discord.js');

module.exports.run = async (bot, message, args, emojis) => {
	// Get text for QR encoding (including file URl)
	let text = args.join(' ');
	if (!text) {
		text = bot.GetImage(message, emojis)[0];
	}
	// send 'waiting' message
	const msg = await message.channel.send('Creating QR code image.');
	try {
		// send image in embed
		const embed = new Discord.MessageEmbed()
			.setImage(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${text.replace(new RegExp(' ', 'g'), '%20')}`);
		msg.delete();
		message.channel.send(embed);
	} catch(err) {
		// if error has occured
		if (bot.config.debug) bot.logger.error(`${err.message} - command: qrcode.`);
		msg.delete();
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 10000 }));
	}
};

module.exports.config = {
	command: 'qrcode',
	aliases: ['qr-code'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'QRcode',
	category: 'Image',
	description: 'Create a QR code.',
	usage: '${PREFIX}qrcode <text | file>',
};
