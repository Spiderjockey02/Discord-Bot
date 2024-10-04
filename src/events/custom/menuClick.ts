import EgglordClient from 'base/Egglord';
import { Event, ErrorEmbed } from '../../structures';
import { ActionRowBuilder, ChannelType, ContextMenuCommandInteraction, LocaleString, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { fetchFromAPI } from '../../utils';

/**
 * Slash create event
 * @event Egglord#SlashCreate
 * @extends {Event}
*/
export default class SlashCreate extends Event {
	constructor() {
		super({
			name: 'menuClick',
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {ContextMenuCommandInteraction} interaction The context menu clicked
	 * @readonly
	*/
	async run(client: EgglordClient, interaction: ContextMenuCommandInteraction) {
		// Check if user is in cooldown
		if (client.commandManager.cooldowns.has(interaction.user.id)) return;


		// Run context menu
		if (client.config.debug) client.logger.debug(`Context menu: ${interaction.commandName} was ran by ${interaction.user.displayName}.`);
		setTimeout(() => {
			client.commandManager.cooldowns.delete(interaction.user.id);
		}, 3_000);


		switch (interaction.commandName) {
			case 'Avatar':
				if (interaction.isUserContextMenuCommand()) client.commandManager.get('avatar')?.reply(client, interaction);
				break;
			case 'Userinfo':
				if (interaction.isUserContextMenuCommand()) client.commandManager.get('user-info')?.reply(client, interaction);
				break;
			case 'Translate': {
				// Only allow this to show in server channels
				if (interaction.channel?.type == ChannelType.DM) {
					const embed = new ErrorEmbed(client, interaction.guild)
						.setMessage('events/message:GUILD_ONLY');

					interaction.reply({ embeds: [embed], ephemeral: true });
				}

				// fetch message and check if message has content
				const message = await interaction.channel?.messages.fetch(interaction.targetId);
				if (!message || message.content) {
					const embed = new ErrorEmbed(client, interaction.guild)
						.setMessage('events/custom:NO_CONTENT');
					return interaction.reply({ embeds: [embed], ephemeral: true });
				}

				// translate message to server language
				try {
					const language = client.languageManager.get(interaction.guild?.settings?.language as LocaleString ?? client.languageManager.getFallback());
					const res = await fetchFromAPI('info/translate', { text: message.content, lang: language });

					interaction.reply({
						content: `Translated to \`${language}\`: ${res}`,
						allowedMentions: { parse: [] },
					});
				} catch (err: any) {
					client.logger.error(`Command: 'Translate' has error: ${err.message}.`);
					const embed = new ErrorEmbed(client, interaction.guild)
						.setMessage('misc:ERROR_MESSAGE', { ERROR: err.message });

					interaction.reply({ embeds: [embed], ephemeral: true });
				}
				break;
			}
			case 'OCR': {
				await interaction.deferReply();

				// fetch message and check if message has attachments
				const message = await interaction.channel?.messages.fetch(interaction.targetId);
				if (!message || !message.attachments.first()?.url) {
					const embed = new ErrorEmbed(client, interaction.guild)
						.setMessage('events/custom:NO_ATTACH');
					return interaction.followUp({ embeds: [embed], ephemeral: true });
				}

				// Get text from image
				const res = await fetchFromAPI('misc/get-text', { url: message.attachments.first()?.url });

				// Make sure text was actually retrieved
				if (!res) {
					const embed = new ErrorEmbed(client, interaction.guild)
						.setMessage('events/custom:NO_TEXT_FROM_ATTACH');
					return interaction.followUp({ embeds: [embed], ephemeral: true });
				}

				return interaction.followUp({ content: `Text from image: \n${res}` });
			}
			case 'Screenshot': {
				// fetch message and check if message has content
				const message = await interaction.channel?.messages.fetch(interaction.targetId);
				if (!message || message.content) {
					const embed = new ErrorEmbed(client, interaction.guild)
						.setMessage('events/custom:NO_CONTENT');
					return interaction.reply({ embeds: [embed], ephemeral: true });
				}

				if (interaction.isUserContextMenuCommand()) client.commandManager.get('screenshot')?.reply(client, interaction);
				break;
			}
			case 'Report': {
				if (interaction.isUserContextMenuCommand() || interaction.isMessageContextMenuCommand()) {
					const type = interaction.commandType == 3 ? 'message' : 'user';
					const modal = new ModalBuilder()
						.setCustomId(`type_${interaction.commandType == 3 ? `message_${interaction.targetMessage.id}` : `user_${interaction.targetUser.id}`}`)
						.setTitle(`Reporting ${type}`)
						.addComponents(
							new ActionRowBuilder<TextInputBuilder>()
								.addComponents(
									new TextInputBuilder()
										.setCustomId('reportReason')
										.setLabel(`Reason for reporting ${type}:`)
										.setStyle(TextInputStyle.Paragraph)
										.setRequired(true)
										.setMaxLength(1024),
								),
						);

					// Show the modal to the user
					interaction.showModal(modal);
				}
				break;
			}
			default:
				interaction.reply({ content: 'Something went wrong' });
		}
	}
}