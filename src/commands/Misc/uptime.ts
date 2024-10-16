import EgglordClient from 'base/Egglord';
import { Command, EgglordEmbed } from '../../structures';
import { ChatInputCommandInteraction, Message } from 'discord.js';

/**
 * Uptime command
 * @extends {Command}
*/
export default class Uptime extends Command {
	constructor(client: EgglordClient) {
		super(client, {
			name: 'uptime',
			dirname: __dirname,
			description: 'Gets the uptime of the client.',
			usage: 'uptime',
			cooldown: 2000,
			slash: true,
		});
	}

	async run(client: EgglordClient, message: Message) {
		if (!message.channel.isSendable()) return;

		const embed = new EgglordEmbed(client, message.guild)
			.setDescription(client.languageManager.translate(message.guild, 'misc/uptime:DESC', { TIME: client.uptime }));
		message.channel.send({ embeds: [embed] });
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const embed = new EgglordEmbed(client, interaction.guild)
			.setDescription(client.languageManager.translate(interaction.guild, 'misc/uptime:DESC', { TIME: client.uptime }));
		return interaction.reply({ embeds: [embed] });
	}
}

