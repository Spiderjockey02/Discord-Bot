// Dependencies
const cheerio = require('cheerio');
const request = require('request');

module.exports.run = async (bot, message, args) => {
	// Make sure a topic was included
	if (!args[0]) {
		if (message.deletable) message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('image').help.usage}\`.` } }).then(m => m.delete({ timeout: 5000 }));
		return;
	}
	const word = args.join(' ');
	const r = await message.channel.send(`Loading image of: \`${word}\`.`);
	image(r, message);
	// Function for getting image
	function image() {
		const options = {
			url: 'http://results.dogpile.com/serp?qc=images&q=' + `${word}`,
			method: 'GET',
			headers: {
				'Accept': 'text/html',
				'User-Agent': 'Chrome',
			},
		};
		request(options, function(error, response, responseBody) {
			if (error) return;
			// Retrieve image(s)
			const $ = cheerio.load(responseBody);
			const links = $('.image a.link');
			const urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr('href'));
			// If no images found
			if (!urls.length) return;
			r.delete();
			// Displays image in channel
			message.channel.send({ embed:{ image:{ url:`${urls[Math.floor(Math.random() * urls.length)]}` } } });
		});
	}
};

module.exports.config = {
	command: 'img',
	aliases: ['image'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Image',
	category: 'image',
	description: 'Finds an image',
	usage: '!image [topic]',
};
