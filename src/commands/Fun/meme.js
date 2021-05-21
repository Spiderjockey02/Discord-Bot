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
	async run(bot, message, settings) {
		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(`${message.checkEmoji() ? bot.customEmojis['loading'] : ''} Fetching ${this.help.name}...`);

		// Retrieve a random meme
		const meme = await bot.Ksoft.images.meme();

		// An error has occured
		if (meme.url == undefined) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: Missing meme URL.`);
			msg.delete();
			return message.channel.error(settings.Language, 'ERROR_MESSAGE', 'Missing URL meme').then(m => setTimeout(() => { m.delete(); }, 5000));
		}

		// Send the meme to channel
		msg.delete();
		const embed = new MessageEmbed()
			.setTitle(`${bot.translate(settings.Language, 'FUN/MEME_TITLE')} /${meme.post.subreddit}`)
			.setColor(16333359)
			.setURL(meme.post.link)
			.setImage(meme.url)
			.setFooter(`👍 ${meme.post.upvotes}   👎 ${meme.post.downvotes} | ${bot.translate(settings.Language, 'FUN/MEME_FOOTER')} KSOFT.API`);
		message.channel.send(embed);
	}
};
