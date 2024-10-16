import { ApplicationCommandOptionType, ChatInputCommandInteraction, Message, PermissionFlagsBits } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { Command, ErrorEmbed } from '../../structures';

export default class TicketCreate extends Command {
	constructor(client: EgglordClient) {
		super(client, {
			name: 'ticket-create',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['t-create', 't-open'],
			botPermissions: [PermissionFlagsBits.ManageChannels],
			description: 'Creates a ticket',
			usage: 'ticket-create [reason]',
			cooldown: 3000,
			examples: ['t-create Something isn\'t working'],
			slash: false,
			isSubCmd: true,
			options: [
				{
					name: 'reason',
					description: 'Reason for creating ticket.',
					type: ApplicationCommandOptionType.String,
					maxLength: 2000,
					required: false,
				},
			],
		});
	}

	async run(client: EgglordClient, message: Message<true>) {
		// get reason
		const reason = (message.args[0]) ? message.args.join(' ') : client.languageManager.translate(message.guild, 'misc:NO_REASON');

		// create channel
		try {
			await message.guild.tickets?.create(message.author, reason);
		} catch (err: any) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			const embed = new ErrorEmbed(client, message.guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
			message.channel.send({ embeds: [embed] });
		}
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const reason = interaction.options.getString('reason') ?? client.languageManager.translate(interaction.guild, 'misc:NO_REASON');

		try {
			const embed = await interaction.guild.tickets?.create(interaction.user, reason);
			if (embed == undefined) return;
			interaction.reply({ embeds: [embed] });
		} catch (err: any) {
			client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);

			const embed = new ErrorEmbed(client, interaction.guild)
				.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
			interaction.reply({ embeds: [embed], ephemeral: true });
		}
	}
}

