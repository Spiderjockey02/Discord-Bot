// Dependencies
const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args, settings) => {
	// Get the right emoji (just in case bot dosen't have external emoji permission)
	const emoji = (message.channel.permissionsFor(bot.user).has('USE_EXTERNAL_EMOJIS')) ? bot.config.emojis.cross : ':negative_squared_cross_mark:';
	// Get pokemon
	const pokemon = args.join(' ');
	if (!pokemon) return message.channel.send({ embed:{ color:15158332, description:`${emoji} Please use the format \`${bot.commands.get('pokemon').help.usage.replace('${prefix}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	// Search for pokemon
	const res = await fetch(`https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/pokedex.php?pokemon=${args.join(' ')}`).then(info => info.json()).catch(err => {
		// An error occured when looking for account
		bot.logger.error(err.message);
		message.channel.send({ embed:{ color:15158332, description:`${emoji} That Pokemon dosen't exist.` } }).then(m => m.delete({ timeout: 3500 }));
		message.delete();
		return;
	});
	// Send response to channel
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
	description: 'Get information on a pokemon.',
	usage: '${prefix}pokemon <pokemon>',
	example: '${prefix}pokemon charizard',
};
