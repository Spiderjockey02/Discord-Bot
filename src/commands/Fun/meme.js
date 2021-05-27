// Dependencies
const { Embed } = require('../../utils'),
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
	async run(bot, message, settings) {
		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// Retrieve a random meme
		const meme = await this.fetchMeme(bot);

		// Send the meme to channel
		msg.delete();
		const embed = new Embed(bot, message.guild)
			.setTitle('fun/meme:TITLE', { SUBREDDIT: meme.post.subreddit })
			.setColor(16333359)
			.setURL(meme.post.link)
			.setImage(meme.url)
			.setFooter('fun/meme:FOOTER', { UPVOTES: meme.post.upvotes.toLocaleString(settings.Language), DOWNVOTES: meme.post.downvotes.toLocaleString(settings.Language) });
		message.channel.send(embed);
	}

	// fetch meme
	async fetchMeme(bot) {
		const meme = await bot.Ksoft.images.meme();
		if (!meme.url) return await this.fetchMeme();
		return meme;
	}
};
