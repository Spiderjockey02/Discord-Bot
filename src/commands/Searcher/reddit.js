// Dependencies
const { MessageEmbed } = require('discord.js'),
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
		if (!message.args[0])	return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(`${message.checkEmoji() ? bot.customEmojis['loading'] : ''} Fetching sub${this.help.name}...`);

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
			const embed = new MessageEmbed()
				.setTitle(`From /${reddit.post.subreddit}`)
				.setURL(reddit.post.link)
				.setImage(reddit.url)
				.setFooter(`👍 ${reddit.post.upvotes}   👎 ${reddit.post.downvotes} | ${bot.translate(settings.Language, 'FUN/MEME_FOOTER')} KSOFT.API`);
			msg.delete();
			message.channel.send(embed);
		} catch (err) {
			if (message.deletable) message.delete();
			msg.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
