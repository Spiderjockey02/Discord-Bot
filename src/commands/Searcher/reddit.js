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
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Get subreddit
		if (!args[0])	return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('reddit').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));

		// try and retrieve image from reddit
		try {
			let reddit;
			// Check if its a NSFW channel or not
			if (message.channel.nsfw) {
				// NSFW content can be shown
				reddit = await bot.Ksoft.images.reddit(args[0], { removeNSFW: false });
			} else {
				reddit = await bot.Ksoft.images.reddit(args[0], { removeNSFW: true });
			}

			// Send message to channel
			const embed = new MessageEmbed()
				.setTitle(`From /${reddit.post.subreddit}`)
				.setURL(reddit.post.link)
				.setImage(reddit.url)
				.setFooter(`👍 ${reddit.post.upvotes}   👎 ${reddit.post.downvotes} | ${message.translate(settings.Language, 'FUN/MEME_FOOTER')} KSOFT.API`);
			message.channel.send(embed);
		} catch (err) {
			console.log(err);
			if (message.deletable) message.delete();
			if (bot.config.debug) bot.logger.error(`${err.message} - command: reddit.`);
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		}
	}
};
