// Dependencies
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args, settings) => {
	// Get pokemon
	const pokemon = args.join(' ');
	if (!pokemon) {
		if (message.deletable) message.delete();
		return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('pokemon').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
	}

	// Search for pokemon
	const res = await fetch(`https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/pokedex.php?pokemon=${args.join(' ')}`).then(info => info.json()).catch(err => {
		// An error occured when looking for account
		if (bot.config.debug) bot.logger.error(`${err.message} - command: pokemon.`);
		if (message.deletable) message.delete();
		return message.error(settings.Language, 'FUN/MISSING_POKEMON').then(m => m.delete({ timeout:5000 }));
	});

	// Send response to channel
	const embed = new MessageEmbed()
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
	usage: '${PREFIX}pokemon <pokemon>',
	example: '${PREFIX}pokemon charizard',
};
