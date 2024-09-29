import EgglordClient from 'base/Egglord';
import { Command, EgglordEmbed, ErrorEmbed } from '../../structures';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, Guild, Message } from 'discord.js';
import { fetchFromAPI } from '../../utils';

/**
 * Reddit command
 * @extends {Command}
*/
export default class Reddit extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(client: EgglordClient) {
		super(client, {
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

	async run(client: EgglordClient, message: Message) {
		if (!message.channel.isSendable()) return;

		// try and retrieve image from reddit
		try {
			const embed = await this.fetchPost(client, message.guild, message.args[0], message.args[1]);
			await message.channel.send({ embeds: [embed] });
		} catch (err: any) {
			if (message.deletable) message.delete();
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);

			const embed = new ErrorEmbed(client, message.guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
			return message.channel.send({ embeds: [embed] });
		}
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const subreddit = interaction.options.getString('subreddit', true),
			flag = interaction.options.getString('flag');

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
		}

		// send subreddit post
		const resp = await this.fetchPost(client, interaction.guild, subreddit, type);
		await interaction.reply({ embeds: [resp] });
	}

	/**
	 * Function for fetching/creating instagram embed.
	 * @param {client} client The instantiating client
	 * @param {guild} guild The guild the command was ran in
	 * @param {string} subreddit The subreddit to get a post from
	 * @returns {embed}
	*/
	async fetchPost(client: EgglordClient, guild: Guild | null, subreddit: string, type = 'hot') {
		try {
			const reddit = await fetchFromAPI('info/reddit', { sub: subreddit, type });
			if (reddit.error) throw new Error(reddit.error);

			// Send message to channel
			return new EgglordEmbed(client, guild)
				.setTitle('searcher/reddit:TITLE', { TITLE: reddit.sub.name })
				.setURL(reddit.permalink)
				.setImage(reddit.thumbnail)
				.setFooter({ text: client.languageManager.translate(guild, 'searcher/reddit:FOOTER', { UPVOTES: reddit.votes.upvotes, DOWNVOTES: reddit.votes.downvotes }) });
		} catch (err: any) {
			client.logger.error(err.message);

			return new ErrorEmbed(client, guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
		}
	}
}

