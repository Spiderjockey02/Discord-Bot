import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Message } from 'discord.js';
import { Command } from '../../structures';
import EgglordClient from '../../base/Egglord';

export default class Dashboard extends Command {
	constructor(client: EgglordClient) {
		super(client, {
			name: 'dashboard',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['db'],
			description: 'Sends a link to your Server\'s dashboard.',
			usage: 'dashboard',
			cooldown: 2000,
			slash: true,
		});
	}

	async run(client: EgglordClient, message: Message<true>) {
		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setLabel('Access the dashboard')
					.setStyle(ButtonStyle.Link)
					.setURL(`${client.config.websiteURL}/dashboard/${message.guild.id}`),
			);
		message.channel.send({ content: 'There you go.', components: [row] });
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setLabel('Access the dashboard')
					.setStyle(ButtonStyle.Link)
					.setURL(`${client.config.websiteURL}/dashboard/${interaction.guildId}`),
			);
		interaction.reply({ content: 'There you go.', components: [row] });
	}
}

