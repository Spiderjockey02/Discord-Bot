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
			slash: true,
		});
	}

	// Function for message command
	async run(bot, message, settings) {
		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// Retrieve a random meme
		const embed = await this.fetchMeme(bot, message.guild, settings);

		// Send the meme to channel
		msg.delete();
		message.channel.send({ embeds: [embed] });
	}

	// Function for slash command
	async callback(bot, interaction, guild) {
		const settings = guild.settings;
		const embed = await this.fetchMeme(bot, guild, settings);
		return interaction.reply({ embeds: [embed] });
	}

	// Fetch meme data
	async fetchMeme(bot, guild, settings) {
		const meme = await bot.Ksoft.images.meme();
		if (!meme.url) {
			return this.fetchMeme();
		} else {
			return new Embed(bot, guild)
				.setTitle('fun/meme:TITLE', { SUBREDDIT: meme.post.subreddit })
				.setColor(16333359)
				.setURL(meme.post.link)
				.setImage(meme.url)
				.setFooter('fun/meme:FOOTER', { UPVOTES: meme.post.upvotes.toLocaleString(settings.Language), DOWNVOTES: meme.post.downvotes.toLocaleString(settings.Language) });
		}
	}
};
