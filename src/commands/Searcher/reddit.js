// Dependencies
const	redditApiImageGetter = require('reddit-api-image-getter'),
	getter = new redditApiImageGetter();

module.exports.run = async (bot, message, args, settings) => {
	if (!args[0])	return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('reddit').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));

	getter.getHotImagesOfSubReddit(args[0]).then(function(result) {
		DisplayMessage(result);
	}).catch((err) => {
		console.log(err);
	});

	function DisplayMessage(result) {
		const rInt = Math.floor(Math.random() * (result.length - 0) + 0) + 1;
		if (!result[rInt]) {
			DisplayMessage(result);
		} else {
			message.channel.send(result[rInt].url);
		}
	}
};

module.exports.config = {
	command: 'reddit',
	aliases: ['subreddit'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'reddit',
	category: 'Searcher',
	description: 'Send a random image from a chosen subreddit.',
	usage: '${PREFIX}reddit <subreddit>',
};
