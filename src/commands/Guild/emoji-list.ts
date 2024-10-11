// Dependencies
import EgglordClient from '../../base/Egglord';
import Command from '../../structures/Command';
import { ChatInputCommandInteraction, Message } from 'discord.js';

/**
 * Emoji-list command
 * @extends {Command}
*/
export default class EmojiList extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor(client: EgglordClient) {
		super(client, {
			name: 'emoji-list',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['emojilist', 'emotes'],
			description: 'Displays the server\'s emojis',
			usage: 'emojilist',
			cooldown: 2000,
			slash: true,
		});
	}

	async run(client: EgglordClient, message: Message<true>) {
		const emojiList = client.languageManager.translate(message.guild, 'guild/emoji-list:MESSAGE', { GUILD: message.guild?.name, EMOJIS: message.guild?.emojis.cache.map(e => e.toString()).join(' ') });
		message.channel.send({ content:  emojiList });
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const guild = interaction.guild;
		const emojiList = client.languageManager.translate(guild, 'guild/emoji-list:MESSAGE', { GUILD: guild?.name, EMOJIS: guild?.emojis.cache.map(e => e.toString()).join(' ') });
		interaction.reply({ content: emojiList });
	}
}

