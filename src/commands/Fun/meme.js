// Dependencies
const { MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Meme extends Command {
	constructor(bot) {
		super(bot, {
			name: 'meme',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Sends a random meme.',
			usage: 'meme',
			cooldown: 1000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Retrieve a random meme
		const meme = await bot.Ksoft.images.meme();

		// An error has occured
		if (meme.url == undefined) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: Missing meme URL.`);
			return message.error(settings.Language, 'ERROR_MESSAGE', 'Missing URL meme').then(m => m.delete({ timeout: 5000 }));
		}

		// Send the meme to channel
		const embed = new MessageEmbed()
			.setTitle(`${message.translate(settings.Language, 'FUN/MEME_TITLE')} /${meme.post.subreddit}`)
			.setColor(16333359)
			.setURL(meme.post.link)
			.setImage(meme.url)
			.setFooter(`👍 ${meme.post.upvotes}   👎 ${meme.post.downvotes} | ${message.translate(settings.Language, 'FUN/MEME_FOOTER')} KSOFT.API`);
		message.channel.send(embed);
	}
};
