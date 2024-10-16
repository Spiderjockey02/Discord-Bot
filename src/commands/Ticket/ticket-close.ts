import EgglordClient from '../../base/Egglord';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, Message, PermissionFlagsBits } from 'discord.js';
import { Command, ErrorEmbed } from '../../structures';

export default class TicketClose extends Command {
	constructor(client: EgglordClient) {
		super(client, {
			name: 'ticket-close',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['t-close'],
			userPermissions: [PermissionFlagsBits.ManageChannels],
			botPermissions: [PermissionFlagsBits.ManageChannels],
			description: 'Closes the current ticket channel',
			usage: 'ticket-close',
			cooldown: 3000,
			slash: false,
			isSubCmd: true,
			options: [
				{
					name: 'transcript',
					type: ApplicationCommandOptionType.Boolean,
					description: 'Whether or not to make a transcript of this ticket.',
				},
			],
		});
	}

	async run(client: EgglordClient, message: Message<true>) {
		const channel = message.channel,
			generateTranscript = Boolean(message.args[0]);

		// will close the current ticket channel
		const regEx = /ticket-\d{18}/g;
		if (channel && regEx.test(channel.name)) {
			try {
				const supportRole = message.guild.settings?.ticketSystem?.supportRoleId;
				if ((supportRole && message.member?.roles.cache.get(supportRole)) || message.member?.permissionsIn(channel).has(PermissionFlagsBits.ManageChannels)) {
				// delete channel
					await message.guild.tickets?.delete(channel, generateTranscript);
				} else {
					const embed = new ErrorEmbed(client, message.guild)
						.setMessage('ticket/ticket-close:NOT_SUPPORT');
					message.channel.send({ embeds: [embed] });
				}
			} catch (err: any) {
				client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);

				const embed = new ErrorEmbed(client, message.guild)
					.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
				message.channel.send({ embeds: [embed] });
			}
		} else {
			const embed = new ErrorEmbed(client, message.guild)
				.setMessage('ticket/ticket-close:NOT_TICKET');
			message.channel.send({ embeds: [embed] });
		}
	}

	async callback(client: EgglordClient, interaction: ChatInputCommandInteraction<'cached'>) {
		const channel = interaction.channel,
			generateTranscript = interaction.options.getBoolean('transcript') ?? false;

		// will close the current ticket channel
		const regEx = /ticket-\d{18}/g;
		if (channel && regEx.test(channel.name)) {
			try {
				const supportRole = interaction.guild.settings?.ticketSystem?.supportRoleId;
				if ((supportRole && interaction.member.roles.cache.get(supportRole)) || interaction.member.permissionsIn(channel).has(PermissionFlagsBits.ManageChannels)) {
					// delete channel
					await interaction.guild.tickets?.delete(channel, generateTranscript);
				} else {
					const embed = new ErrorEmbed(client, interaction.guild)
						.setMessage('ticket/ticket-close:NOT_SUPPORT');
					interaction.reply({ embeds: [embed], ephemeral: true });
				}
			} catch (err: any) {
				client.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);

				const embed = new ErrorEmbed(client, interaction.guild)
					.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });
				interaction.reply({ embeds: [embed], ephemeral: true });
			}
		} else {
			const embed = new ErrorEmbed(client, interaction.guild)
				.setMessage('ticket/ticket-close:NOT_TICKET');
			interaction.reply({ embeds: [embed], ephemeral: true });
		}
	}
}

