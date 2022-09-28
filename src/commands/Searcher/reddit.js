// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Reddit command
 * @extends {Command}
*/
class Reddit extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'reddit',
			dirname: __dirname,
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks],
			description: 'Send a random image from a chosen subreddit.',
			usage: 'reddit <subreddit>',
			cooldown: 3000,
			examples: ['reddit meme'],
			slash: true,
			options: [{
				name: 'subreddit',
				description: 'Name of subreddit.',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
			{
				name: 'flag',
				description: '(H)ot, (N)ew or (T)op',
				type: ApplicationCommandOptionType.String,
				choices: ['-h', '-n', '-t'].map(i => ({ name: i, value: i })),
			}],
		});
	}

	/**
 	 * Function for receiving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(bot, message, settings) {
		// Get subreddit
		if (!message.args[0])	return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/reddit:USAGE')) });

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['loading'] : '', ITEM: `sub${this.help.name}` }));

		// try and retrieve image from reddit
		try {
			const resp = await this.fetchPost(bot, message.channel, message.args[0]);
			msg.delete();
			await message.channel.send({ embeds: [resp] });
		} catch (err) {
			if (message.deletable) message.delete();
			msg.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {bot} bot The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const channel = guild.channels.cache.get(interaction.channelId),
			subreddit = args.get('subreddit').value,
			flag = args.get('flag')?.value;

		let type;
		switch (flag) {
			case '-h':
				type = 'hot';
				break;
			case '-n':
				type = 'new';
				break;
			case '-t':
				type = 'top';
				break;
		}
		// send subreddit post
		try {
			const resp = await this.fetchPost(bot, channel, subreddit, { type });
			await interaction.reply({ embeds: [resp] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}

	/**
	 * Function for fetching/creating instagram embed.
	 * @param {bot} bot The instantiating client
	 * @param {guild} guild The guild the command was ran in
	 * @param {string} subreddit The subreddit to get a post from
	 * @returns {embed}
	*/
	async fetchPost(bot, channel, subreddit, { type } = 'hot') {
		let reddit;
		try {
			// Whether or not to remove NSFW content
			reddit = await bot.reddit.fetchSubreddit(subreddit, { removeNSFW: !(channel.nsfw || channel.type == 'DM'), type });

			// Send message to channel
			return new Embed(bot, channel.guild)
				.setTitle('searcher/reddit:TITLE', { TITLE: reddit.subreddit })
				.setURL(reddit.link)
				.setImage(reddit.imageURL)
				.setFooter({ text: channel.guild.translate('searcher/reddit:FOOTER', { UPVOTES: reddit.upvotes.toLocaleString(channel.guild.settings.Language), DOWNVOTES: reddit.downvotes.toLocaleString(channel.guild.settings.Language) }) });
		} catch (err) {
			bot.logger.error(err.message);
			return channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true);
		}
	}
}

module.exports = Reddit;
