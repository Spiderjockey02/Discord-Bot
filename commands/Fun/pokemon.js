// Dependencies
const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args) => {
	const res = await fetch(`https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/pokedex.php?pokemon=${args.join(' ')}`).then(info => info.json()).catch(error => {
		// An error occured when looking for account
		bot.logger.error(`${error.message ? error.message : error}`);
		message.delete();
		message.channel.send('That Pokemon dosen\'t exist.').then(m => m.delete({ timeout: 3500 }));
		return;
	});
	const embed = new Discord.MessageEmbed()
		.setAuthor(res.name, `https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${res.images.typeIcon}`)
		.setDescription(`Type of this pokemon is **${res.info.type}**. ${res.info.description}`)
		.setThumbnail(`https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${res.images.photo}`)
		.setFooter(`Weakness of pokemon - ${res.info.weakness}`, `https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/${res.images.weaknessIcon}`);
	message.channel.send(embed);
};

module.exports.config = {
	command: 'pokemon',
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'pokemon',
	category: 'Fun',
	description: 'Get information on a pokemon',
	usage: '!pokemon',
};
