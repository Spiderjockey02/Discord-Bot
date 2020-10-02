// Dependencies
const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {
	// Get text for QR encoding (including file URl)
	let text = args.join(' ');
	if (!text) {
		// check if an attachment was added
		if (message.attachments.size > 0) {
			text = message.attachments.first().url;
		} else {
			return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('qrcode').help.usage}\`.` } }).then(m => m.delete({ timeout: 5000 }));
		}
	}
	// send 'waiting' message
	const msg = await message.channel.send('Creating QR code image.');
	try {
		// send image in embed
		const embed = new Discord.MessageEmbed()
			.setImage(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${text.replace(new RegExp(' ', 'g'), '%20')}`);
		msg.delete();
		message.channel.send(embed);
	} catch(e) {
		// if error has occured
		bot.logger.log(e.message);
		msg.delete();
		message.channel.send('An error has occured when running this command.').then(m => m.delete({ timeout:3500 }));
	}
};

module.exports.config = {
	command: 'qrcode',
	aliases: ['qr-code'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'QRcode',
	category: 'image',
	description: 'Create a QR code.',
	usage: '!qrcode [text or file]',
};
