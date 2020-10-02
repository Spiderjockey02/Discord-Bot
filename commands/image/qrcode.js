// Dependencies
const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {
	// Get text
	const text = args.join(' ');
	if (!text) return message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('qrcode').help.usage}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	try {
		const embed = new Discord.MessageEmbed()
			.setImage(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${text.replace(new RegExp(' ', 'g'), '%20')}`);
		message.channel.send(embed);
	} catch(e) {
		console.log(e);
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
	description: 'Fake twitter account',
	usage: '!qrcode [text]',
};
