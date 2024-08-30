import { fetchFromAPI } from '../../utils';
import { Command, ErrorEmbed, EgglordEmbed } from '../../structures';
import EgglordClient from '../../base/Egglord';
import { ChatInputCommandInteraction, Message } from 'discord.js';

/**
 * Fact command
 * @extends {Command}
*/
export default class Fact extends Command {
	constructor() {
		super({
			name: 'fact',
			dirname: __dirname,
			aliases: ['facts'],
			description: 'Receive a random fact.',
			usage: 'fact',
			slash: true,
			cooldown: 1000,
		});
	}

	async run(client: EgglordClient, message: Message) {
		const fact = await fetchFromAPI('misc/random-fact');
		if (fact.error) {
			client.logger.error(`Command: '${this.help.name}' has error: ${fact.message}.`);

			const embed = new ErrorEmbed(client, message.guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: fact.message });
			return message.channel.send({ embeds: [embed] });
		}

		const embed = new EgglordEmbed(client, message.guild)
			.setTitle('fun/fact:FACT_TITLE')
			.setDescription(fact);
		return embed;
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const fact = await fetchFromAPI('misc/random-fact');
		if (fact.error) {
			client.logger.error(`Command: '${this.help.name}' has error: ${fact.message}.`);

			const embed = new ErrorEmbed(client, interaction.guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: fact.message });
			return interaction.reply({ embeds: [embed] });
		}

		const embed = new EgglordEmbed(client, interaction.guild)
			.setTitle('fun/fact:FACT_TITLE')
			.setDescription(fact);
		interaction.reply({ embeds: [embed] });
	}
}