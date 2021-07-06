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
			slash: true,
			options: [{
				name: 'subreddit',
				description: 'Name of subreddit.',
				type: 'STRING',
				required: true,
			}],
		});
	}

	// Function for message command
	async run(bot, message, settings) {
		// Get subreddit
		if (!message.args[0])	return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/reddit:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: `sub${this.help.name}` }));

		// try and retrieve image from reddit
		try {
			const resp = await this.fetchPost(bot, message.channel, message.args[0]);
			msg.delete();
			await message.channel.send({ embeds: [resp] });
		} catch (err) {
			if (message.deletable) message.delete();
			msg.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}

	// Function for slash command
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId),
			subreddit = args.get('subreddit').value;

		// send subreddit post
		try {
			const resp = await this.fetchPost(bot, channel, subreddit);
			await bot.send(interaction, { embeds: [resp] });
		} catch (err) {
			console.log(err);
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return bot.send(interaction, { embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}

	// fetch a random post from the subreddit
	async fetchPost(bot, channel, subreddit) {
		let reddit;
		// Check if its a NSFW channel or not
		if (channel.nsfw) {
			// NSFW content can be shown
			reddit = await bot.Ksoft.images.reddit(subreddit, { removeNSFW: false });
		} else {
			reddit = await bot.Ksoft.images.reddit(subreddit, { removeNSFW: true });
		}

		// Send message to channel
		const embed = new Embed(bot, channel.guild)
			.setTitle('searcher/reddit:TITLE', { TITLE: reddit.post.subreddit })
			.setURL(reddit.post.link)
			.setImage(reddit.url)
			.setFooter('searcher/reddit:FOOTER', { UPVOTES: reddit.post.upvotes.toLocaleString(channel.guild.settings.Language), DOWNVOTES: reddit.post.downvotes.toLocaleString(channel.guild.settings.Language) });
		return embed;
	}
};
