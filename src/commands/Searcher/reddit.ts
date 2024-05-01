// Dependencies
const { Embed } = require('../../utils'),
	{ ApplicationCommandOptionType } = require('discord.js'), ;
import Command from '../../structures/Command';

/**
 * Reddit command
 * @extends {Command}
*/
export default class Reddit extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor() {
		super({
			name: 'reddit',
			dirname: __dirname,
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
 	 * @param {client} client The instantiating client
 	 * @param {message} message The message that ran the command
	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(client, message, settings) {
		// Get subreddit
		if (!message.args[0])	return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('searcher/reddit:USAGE')) });

		// send 'waiting' message to show client has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? client.customEmojis['loading'] : '', ITEM: `sub${this.help.name}` }));

		// try and retrieve image from reddit
		try {
			const resp = await this.fetchPost(client, message.channel, message.args[0]);
			msg.delete();
			await message.channel.send({ embeds: [resp] });
		} catch (err) {
			if (message.deletable) message.delete();
			msg.delete();
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
	}

	/**
 	 * Function for receiving interaction.
 	 * @param {client} client The instantiating client
 	 * @param {interaction} interaction The interaction that ran the command
 	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
 	 * @readonly
	*/
	async callback(client, interaction, guild, args) {
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
			const resp = await this.fetchPost(client, channel, subreddit, type);
			await interaction.reply({ embeds: [resp] });
		} catch (err) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}

	/**
	 * Function for fetching/creating instagram embed.
	 * @param {client} client The instantiating client
	 * @param {guild} guild The guild the command was ran in
	 * @param {string} subreddit The subreddit to get a post from
	 * @returns {embed}
	*/
	async fetchPost(client, channel, subreddit, type = 'hot') {
		try {
			const reddit = await client.fetch('info/reddit', { sub: subreddit, type: type });
			if (reddit.error) throw new Error(reddit.error);

			// Send message to channel
			return new Embed(client, channel.guild)
				.setTitle('searcher/reddit:TITLE', { TITLE: reddit.sub.name })
				.setURL(reddit.permalink)
				.setImage(reddit.thumbnail)
				.setFooter({ text: channel.guild.translate('searcher/reddit:FOOTER', { UPVOTES: reddit.votes.upvotes.toLocaleString(channel.guild.settings.Language), DOWNVOTES: reddit.votes.downvotes.toLocaleString(channel.guild.settings.Language) }) });
		} catch (err) {
			client.logger.error(err.message);
			return channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true);
		}
	}
}

