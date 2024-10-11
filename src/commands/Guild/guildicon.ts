import EgglordClient from 'base/Egglord';
import { Command, EgglordEmbed } from '../../structures';
import ImageManipulator from '../../helpers/ImageManipulator';
import { AttachmentBuilder, ChatInputCommandInteraction, Message } from 'discord.js';

/**
 * Guildicon command
 * @extends {Command}
*/
export default class Guildicon extends Command {
	constructor(client: EgglordClient) {
		super(client, {
			name:  'guildicon',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['servericon'],
			description: 'Get the server\'s icon.',
			usage: 'guildicon',
			cooldown: 2000,
			slash: true,
		});
	}

	async run(client: EgglordClient, message: Message<true>) {
		// Check for guild icon & send message
		const embed = new EgglordEmbed(client, message.guild)
			.setDescription(client.languageManager.translate(message.guild, 'guild/guildicon:ICON', { URL: message.guild.iconURL({ size: 1024 }) }));

		if (message.guild.icon == null) {
			const icon = await ImageManipulator.guildIcon(message.guild.name, 1024);
			const attachment = new AttachmentBuilder(icon, { name: 'guildicon.png' });
			embed.setImage('attachment://guildicon.png');
			message.channel.send({ embeds: [embed], files: [attachment] });
		} else {
			embed.setImage(message.guild.iconURL({ size: 1024 }));
			message.channel.send({ embeds: [embed] });
		}
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const guild = interaction.guild;

		const embed = new EgglordEmbed(client, guild)
			.setDescription(client.languageManager.translate(guild, 'guild/guildicon:ICON', { URL: guild.iconURL({ size: 1024 }) }));

		if (guild.icon == null) {
			const icon = await ImageManipulator.guildIcon(interaction.guild.name, 1024);
			const attachment = new AttachmentBuilder(icon, { name: 'guildicon.png' });
			embed.setImage('attachment://guildicon.png');
			interaction.reply({ embeds: [embed], files: [attachment] });
		} else {
			embed.setImage(guild.iconURL({ size: 1024 }));
			interaction.reply({ embeds: [embed] });
		}
	}
}

