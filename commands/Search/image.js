// Dependencies
const cheerio = require('cheerio');
const request = require('request');

module.exports.run = async (bot, message, args) => {
	if (!args[0]) {
		if (message.deletable) message.delete();
		message.channel.send({ embed:{ color:15158332, description:`${bot.config.emojis.cross} Please use the format \`${bot.commands.get('image').help.usage}\`.` } }).then(m => m.delete({ timeout: 5000 }));
		return;
	}
	const word = args.join(' ');
	// console.log(word)
	const r = await message.channel.send(`Loading image of: ${word}.`);
	image(message);
	// Function for getting image
	function image(message) {
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
			$ = cheerio.load(responseBody);
			const links = $('.image a.link');
			const urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr('href'));
			// console.log(urls);
			if (!urls.length) return;
			r.delete();
			// display image
			message.channel.send({ embed:{ image:{ url:`${urls[Math.floor(Math.random() * urls.length)]}` } } });
		});
	}
};
module.exports.config = {
	command: 'image',
	aliases: ['img'],
};
module.exports.help = {
	name: 'Image',
	category: 'Search',
	description: 'Finds an image',
	usage: '!image [topic]',
};
