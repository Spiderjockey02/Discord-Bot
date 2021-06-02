// Dependencies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Reddit extends Command {
	constructor(bot) {
		super(bot, {
			name: 'reddit',
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Send a random image from a chosen subreddit.',
			usage: 'reddit <subreddit>',
			cooldown: 3000,
			examples: ['reddit meme'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Get subreddit
		if (!message.args[0])	return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/reddit:USAGE')) }).then(m => m.delete({ timeout: 5000 }));

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: `sub${this.help.name}` }));

		// try and retrieve image from reddit
		try {
			let reddit;
			// Check if its a NSFW channel or not
			if (message.channel.nsfw) {
				// NSFW content can be shown
				reddit = await bot.Ksoft.images.reddit(message.args[0], { removeNSFW: false });
			} else {
				reddit = await bot.Ksoft.images.reddit(message.args[0], { removeNSFW: true });
			}

			// Send message to channel
			const embed = new Embed(bot, message.guild)
				.setTitle('searcher/reddit:TITLE', { TITLE: reddit.post.subreddit })
				.setURL(reddit.post.link)
				.setImage(reddit.url)
				.setFooter('searcher/reddit:FOOTER', { UPVOTES: reddit.post.upvotes.toLocaleString(settings.Language), DOWNVOTES: reddit.post.downvotes.toLocaleString(settings.Language) });
			msg.delete();
			message.channel.send(embed);
		} catch (err) {
			if (message.deletable) message.delete();
			msg.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
