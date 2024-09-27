import { Command } from '../../structures';
import EgglordClient from '../../base/Egglord';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, Message } from 'discord.js';

/**
 * Flip command
 * @extends {Command}
*/
export default class RandomCaps extends Command {
	constructor(client: EgglordClient) {
		super(client, {
			name: 'random-capitalisation',
			dirname: __dirname,
			description: 'Generate a random caps',
			usage: 'random-capitalisation <string>',
			cooldown: 1000,
			slash: false,
			isSubCmd: true,
			options: [{
				name: 'text',
				description: 'Text for random caps',
				type: ApplicationCommandOptionType.String,
				maxLength: 2000,
				required: true,
			}],
		});
	}

	async run(_client: EgglordClient, message: Message) {
		if (!message.channel.isSendable()) return;

		const text = message.args.join(' '),
			rndCaps = text.toLowerCase().split('').map(c => Math.random() < 0.5 ? c : c.toUpperCase()).join('');
		message.channel.send({ content: rndCaps });
	}


	async callback(_client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const text = interaction.options.getString('text', true),
			rndCaps = text.toLowerCase().split('').map(c => Math.random() < 0.5 ? c : c.toUpperCase()).join('');

		// send result
		return interaction.reply({ content: rndCaps });
	}
}