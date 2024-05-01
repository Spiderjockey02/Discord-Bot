import { ModalSubmitInteraction } from 'discord.js';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';

/**
 * modal submit event
 * @event Egglord#ModalSubmit
 * @extends {Event}
*/
export default class ModalSubmit extends Event {
	constructor() {
		super({
			name: 'modalSubmit',
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {ModalSubmitInteraction} interaction The member that was warned
	 * @readonly
	*/
	async run(client: EgglordClient, interaction: ModalSubmitInteraction<'cached'>) {
		if (!interaction.guild) return interaction.reply({ content: 'Server only' });
		const { guild, member } = interaction;

		const reason = interaction.fields.fields.get('reportReason')?.value;
		const channel = guild.channels.cache.get(guild.settings.ModLogChannel);

		if (!channel) return interaction.reply({ content: 'No channel set for logging' });

		if (guild.settings.ModLogEvents?.includes('REPORT')) {
			const embed = new Embed(client, guild)
				.setTitle(`Reported ${interaction.customId.split('_')[1]}`)
				.setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
				.addFields(
					{ name: 'Reason:', value: reason ?? 'No reason given' },
				)
				.setTimestamp()
				.setFooter({ text: guild.name });

			// Add custom fields
			switch (interaction.customId.split('_')[1]) {
				case 'user': {
					const user = await client.users.fetch(interaction.customId.split('_')[2]);
					embed.addFields(
						{ name: 'Tag:', value: user.displayName, inline: true },
						{ name: 'Created at:', value: moment(user.createdAt).format('lll'), inline: true },
					)
						.setImage(user.displayAvatarURL());
					break;
				}
				case 'message': {
					const message = await interaction.channel.messages.fetch(interaction.customId.split('_')[2]);
					embed.addFields(
						{ name: 'Content:', value: message.content, inline: true },
					);
					break;
				}

				default:

			}


			// Send report embed to mod log channel
			const repChannel = guild.channels.cache.get(guild.settings.ModLogChannel);
			if (repChannel) {
				repChannel.send({ embeds: [embed] });
				interaction.reply({ embeds: [channel.error('moderation/report:SUCCESS', { USER: member.user }, true)] });
			}

		} else {
			interaction.reply({ content: 'Reporting is not enabled in this server' });
		}

	}
}

