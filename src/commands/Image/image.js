// Dependencies
const { image_search } = require('duckduckgo-images-api');
const { MessageEmbed } = require('discord.js');

module.exports.run = async (bot, message, args, settings) => {
	// Make sure a topic was included
	if (!args[0]) {
		if (message.deletable) message.delete();
		return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('img').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
	}

	let results;
	if (message.channel.nsfw || message.channel.type == 'dm') {
		// NSFW content can be shown
		results = await image_search({ query: args.join(' '), moderate: false, iterations: 2, retries: 2 });
	} else {
		// NSFW can't be shown
		results = await image_search({ query: args.join(' '), moderate: true, iterations: 2, retries: 2 });
	}

	// send image
	const embed = new MessageEmbed()
		.setImage(results[Math.floor(Math.random() * 101)].image);
	message.channel.send(embed);
};

module.exports.config = {
	command: 'img',
	aliases: ['image'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Image',
	category: 'Image',
	description: 'Finds an image based on the topic.',
	usage: '${PREFIX}image <topic>',
};
