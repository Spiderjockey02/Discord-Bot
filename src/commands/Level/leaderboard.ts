import EgglordClient from 'base/Egglord';
import Command from '../../structures/Command';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Message } from 'discord.js';

export default class Leaderboard extends Command {
	constructor(client: EgglordClient) {
		super(client, {
			name: 'leaderboard',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['lb', 'levels', 'ranks'],
			description: 'Displays the Servers\'s level leaderboard.',
			usage: 'leaderboard',
			cooldown: 3000,
			slash: true,
		});
	}

	async run(client: EgglordClient, message: Message<true>) {
		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setLabel('Access the leaderboard')
					.setStyle(ButtonStyle.Link)
					.setURL(`${client.config.websiteURL}/leaderboard/${message.guild.id}`),
			);
		message.channel.send({ content: 'There you go.', components: [row] });
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setLabel('Access the leaderboard')
					.setStyle(ButtonStyle.Link)
					.setURL(`${client.config.websiteURL}/leaderboard/${interaction.guild.id}`),
			);
		interaction.reply({ content: 'There you go.', components: [row] });
	}
}

