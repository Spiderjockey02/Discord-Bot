// Dependencies
const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args, emoji, settings) => {
	// Get user
	const user = (message.mentions.users.first()) ? message.mentions.users.first() : message.author;
	// Get text
	let text = args.join(' ');
	text = text.replace(/<@.?[0-9]*?>/g, '');
	// Make sure text was entered
	if (!text) return message.channel.send({ embed:{ color:15158332, description:`${emoji} Please use the format \`${bot.commands.get('phcomment').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	// make sure the text isn't longer than 70 characters
	if (text.length >= 71) return message.channel.send({ embed:{ color:15158332, description:`${emoji} Your message must not be more than 70 characters.` } }).then(m => m.delete({ timeout: 5000 }));
	// send 'waiting' message
	const msg = await message.channel.send('Creating fake pornhub comment.');
	try {
		const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=phcomment&username=${user.username}&image=${user.displayAvatarURL({ format: 'png', size: 512 })}&text=${text}`));
		const json = await res.json();
		// send image in embed
		const embed = new Discord.MessageEmbed()
			.setImage(json.message);
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
	command: 'phcomment',
	aliases: ['ph', 'ph-comment'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'phcomment',
	category: 'Image',
	description: 'Fake pornhub comment',
	usage: '${PREFIX}phcomment [user] <text>',
};
