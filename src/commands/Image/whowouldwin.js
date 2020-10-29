// Dependencies
const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args, emojis, settings) => {
	// Get user
	const user1 = message.mentions.users.first();
	if (!user1) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('whowouldwin').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	let user2;
	if (args[1]) {
		user2 = message.mentions.users.array()[1];
	} else {
		user2 = message.author;
	}
	// send 'waitng' message
	const msg = await message.channel.send('Creating who would win image.');
	try {
		const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=whowouldwin&user1=${user1.displayAvatarURL({ format: 'png', size: 512 })}&user2=${user2.displayAvatarURL({ format: 'png', size: 512 })}`));
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
		message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} An error occured when running this command, please try again or contact support.` } }).then(m => m.delete({ timeout: 10000 }));
	}
};

module.exports.config = {
	command: 'whowouldwin',
	aliases: ['www'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'whowouldwin',
	category: 'Image',
	description: 'Create a whowouldwin image.',
	usage: '${PREFIX}whowouldwin <user1> [user2]',
};
