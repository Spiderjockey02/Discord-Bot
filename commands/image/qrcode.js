// Dependencies
const Discord = require('discord.js');

module.exports.run = async (bot, message, args, settings) => {
	const emoji = (message.channel.permissionsFor(bot.user).has('USE_EXTERNAL_EMOJIS')) ? bot.config.emojis.cross : ':negative_squared_cross_mark:';
	// Get text for QR encoding (including file URl)
	let text = args.join(' ');
	if (!text) {
		// check if an attachment was added
		if (message.attachments.size > 0) {
			text = message.attachments.first().url;
		} else {
			return message.channel.send({ embed:{ color:15158332, description:`${emoji} Please use the format \`${bot.commands.get('qrcode').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
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
	} catch(err) {
		// if error has occured
		bot.logger.log(err.message);
		msg.delete();
		message.channel.send({ embed:{ color:15158332, description:`${emoji} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 10000 }));
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
	usage: '${PREFIX}qrcode <text | file>',
};
