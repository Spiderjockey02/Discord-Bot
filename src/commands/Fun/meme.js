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
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Retrieve a random meme
		const meme = await bot.Ksoft.images.meme();

		// An error has occured
		if (meme.url == undefined) {
			if (bot.config.debug) bot.logger.error('An error occured when running command: meme.');
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
			if (message.deletable) message.delete();
			return;
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
