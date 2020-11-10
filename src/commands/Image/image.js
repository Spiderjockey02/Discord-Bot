// Dependencies
const { load } = require('cheerio');
const request = require('request');

module.exports.run = async (bot, message, args, emojis, settings) => {
	// Make sure a topic was included
	if (!args[0]) {
		try {
			if (message.deletable) message.delete();
			return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('img').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
		} catch (e) {
			console.log(e);
		}
	}
	const word = args.join(' ');
	// send 'waiting' message
	const msg = await message.sendT(settings.Language, 'IMAGE/GENERATING_IMAGE');

	// Option for searching for image
	const options = {
		url: 'http://results.dogpile.com/serp?qc=images&q=' + `${word}`,
		method: 'GET',
		headers: {
			'Accept': 'text/html',
			'User-Agent': 'Chrome',
		},
	};

	// search for image
	request(options, function(error, response, responseBody) {
		// if an error occured
		if (error) {
			if (message.deletable) message.delete();
			msg.delete();
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
			return;
		}
		// Retrieve image(s)
		const $ = load(responseBody);
		const links = $('.image a.link');
		const urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr('href'));
		// If no images found
		if (!urls.length) {
			if (message.deletable) message.delete();
			msg.delete();
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
			return;
		}
		// Displays image in channel
		msg.delete();
		message.channel.send({ embed:{ image:{ url:`${urls[Math.floor(Math.random() * urls.length)]}` } } });
	});

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
