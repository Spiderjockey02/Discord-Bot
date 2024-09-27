import { ChatInputCommandInteraction, Message } from 'discord.js';
import { Command, ErrorEmbed, EgglordEmbed } from '../../structures';
import { fetchFromAPI } from '../../utils';
import EgglordClient from '../../base/Egglord';

/**
 * Advice command
 * @extends {Command}
*/
export default class AdviceCommand extends Command {
	constructor(client: EgglordClient) {
		super(client, {
			name: 'advice',
			dirname: __dirname,
			description: 'Get some random advice',
			usage: 'advice',
			cooldown: 1000,
			slash: true,
		});
	}

	async run(client: EgglordClient, message: Message) {
		if (!message.channel.isSendable()) return;

		const advice = await fetchFromAPI('misc/advice');
		if (advice.error) {
			client.logger.error(`Command: '${this.help.name}' has error: ${advice.error}.`);
			const embed = new ErrorEmbed(client, message.guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: advice.error });

			return message.channel.send({ embeds: [embed] });
		}

		const embed = new EgglordEmbed(client, null)
			.setDescription(`💡 ${advice}`);
		message.channel.send({ embeds: [embed] });
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {

		const advice = await fetchFromAPI('misc/advice');
		if (advice.error) {
			client.logger.error(`Command: '${this.help.name}' has error: ${advice.error}.`);
			const embed = new ErrorEmbed(client, interaction.guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: advice.error });

			return interaction.reply({ embeds: [embed] });
		}

		const embed = new EgglordEmbed(client, null)
			.setDescription(`💡 ${advice}`);
		await interaction.reply({ embeds: [embed] });
	}
}
