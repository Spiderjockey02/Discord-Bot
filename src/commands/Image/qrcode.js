// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports.run = async (bot, message, args, settings) => {
	// Get text for QR encoding (including file URl)
	let text = args.join(' ');
	if (!text) text = bot.GetImage(message, args, settings.Language);

	// send 'waiting' message
	const msg = await message.sendT(settings.Language, 'IMAGE/GENERATING_IMAGE');

	// Try and convert image
	try {
		// send image in embed
		const embed = new MessageEmbed()
			.setImage(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${text.replace(new RegExp(' ', 'g'), '%20')}`);
		msg.delete();
		message.channel.send(embed);
	} catch(err) {
		// if error has occured
		if (bot.config.debug) bot.logger.error(`${err.message} - command: qrcode.`);
		msg.delete();
		message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
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
