import EgglordClient from '../../base/Egglord';
import { Command, EgglordEmbed, ErrorEmbed } from '../../structures';
import { fetchFromAPI } from '../../utils';
import { ChatInputCommandInteraction, Guild, Message } from 'discord.js';
const memes = ['meme', 'memes', 'dankmemes', 'ComedyCemetery'];

export default class Meme extends Command {
	constructor() {
		super({
			name: 'meme',
			dirname: __dirname,
			description: 'Sends a random meme.',
			usage: 'meme',
			cooldown: 1000,
			slash: true,
		});
	}

	async run(client: EgglordClient, message: Message) {
		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send({
			content: client.languageManager.translate(message.guild, 'misc:FETCHING', {
				EMOJI: client.customEmojis['loading'], ITEM: this.help.name }),
		});

		const meme = await fetchFromAPI('info/reddit', { sub: memes[Math.floor((Math.random() * memes.length))] });
		if (meme.error) {
			client.logger.error(`Command: '${this.help.name}' has error: ${meme.message}.`);

			const embed = new ErrorEmbed(client, message.guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: meme.message });
			return message.channel.send({ embeds: [embed] });
		}

		const embed = new EgglordEmbed(client, message.guild)
			.setTitle('searcher/reddit:TITLE', { TITLE: meme.sub.name })
			.setURL(meme.permalink)
			.setImage(meme.thumbnail)
			.setFooter({ text: client.languageManager.translate(message.guild, 'searcher/reddit:FOOTER', {
				UPVOTES: meme.votes.upvotes.toLocaleString(message.guild?.settings?.language ?? client.languageManager.getFallback()),
				DOWNVOTES: meme.votes.downvotes.toLocaleString(message.guild?.settings?.language ?? client.languageManager.getFallback()) }),
			});

		// Send the meme to channel
		msg.delete();
		message.channel.send({ embeds: [embed] });
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>, guild: Guild) {
		const meme = await fetchFromAPI('info/reddit', { sub: memes[Math.floor((Math.random() * memes.length))] });
		if (meme.error) {
			client.logger.error(`Command: '${this.help.name}' has error: ${meme.message}.`);

			const embed = new ErrorEmbed(client, interaction.guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: meme.message });
			interaction.reply({ embeds: [embed], ephemeral: true });
		}

		const embed = new EgglordEmbed(client, guild)
			.setTitle('searcher/reddit:TITLE', { TITLE: meme.sub.name })
			.setURL(meme.permalink)
			.setImage(meme.thumbnail)
			.setFooter({ text: client.languageManager.translate(guild, 'searcher/reddit:FOOTER', {
				UPVOTES: meme.votes.upvotes.toLocaleString(guild?.settings?.language ?? client.languageManager.getFallback()),
				DOWNVOTES: meme.votes.downvotes.toLocaleString(guild?.settings?.language ?? client.languageManager.getFallback()) }),
			});

		return interaction.reply({ embeds: [embed] });
	}
}