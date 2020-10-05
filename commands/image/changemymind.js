// Dependencies
const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args, settings) => {
	// Get the right emoji (just in case bot dosen't have external emoji permission)
	const emoji = (message.channel.permissionsFor(bot.user).has('USE_EXTERNAL_EMOJIS')) ? bot.config.emojis.cross : ':negative_squared_cross_mark:';
	// Get text
	const text = args.join(' ');
	// make sure text was entered
	if (!text) return message.channel.send({ embed:{ color:15158332, description:`${emoji} Please use the format \`${bot.commands.get('changemymind').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	// make sure the text isn't longer than 70 characters
	if (text.length >= 81) return message.channel.send({ embed:{ color:15158332, description:`${emoji} Your message must not be more than 80 characters.` } }).then(m => m.delete({ timeout: 5000 }));
	// send 'waiting' message
	const msg = await message.channel.send('Creating changemymind image.');
	try {
		const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=changemymind&text=${text}`));
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
	command: 'changemymind',
	aliases: ['cmm'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'changemymind',
	category: 'image',
	description: 'Fake changemymind message',
	usage: '${PREFIX}changemymind <text>',
};
