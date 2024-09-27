import EgglordClient from '../../base/Egglord';
import { Command, EgglordEmbed } from '../../structures';
import { ChatInputCommandInteraction, Message } from 'discord.js';

/**
 * Flip command
 * @extends {Command}
*/
export default class Flip extends Command {
	constructor(client: EgglordClient) {
		super(client, {
			name: 'flip',
			dirname: __dirname,
			description: 'Flip a coin.',
			usage: 'flip',
			cooldown: 1000,
			slash: true,
		});
	}

	async run(client: EgglordClient, message: Message) {
		if (!message.channel.isSendable()) return;

		const num = Math.round(Math.random()),
			emoji = client.customEmojis[['head', 'tail'][num] as 'head' | 'tail'],
			result = client.languageManager.translate(message.guild, `fun/flip:${num < 0.5 ? 'HEADS' : 'TAILS'}`);

		const embed = new EgglordEmbed(client, null)
			.setDescription(`${emoji} ${result}`);
		message.channel.send({ embeds: [embed] });
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const num = Math.round(Math.random()),
			emoji = client.customEmojis[['head', 'tail'][num] as 'head' | 'tail'],
			result = client.languageManager.translate(interaction.guild, `fun/flip:${num < 0.5 ? 'HEADS' : 'TAILS'}`);

		const embed = new EgglordEmbed(client, null)
			.setDescription(`${emoji} ${result}`);
		interaction.reply({ embeds: [embed] });
	}
}