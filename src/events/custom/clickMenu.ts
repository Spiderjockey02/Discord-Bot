import Event from 'src/structures/Event';
import { Collection, ModalBuilder, TextInputStyle, TextInputBuilder, ActionRowBuilder, ChannelType, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from 'discord.js';
import EgglordClient from 'src/base/Egglord';

/**
 * click menu event
 * @event Egglord#ClickMenu
 * @extends {Event}
*/
export default class ClickMenu extends Event {
	constructor() {
		super({
			name: 'clickMenu',
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {CommandInteraction} interaction The context menu clicked
	 * @readonly
	*/
	async run(client: EgglordClient, interaction: UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction) {
		const guild = client.guilds.cache.get(interaction.guildId),
			channel = client.channels.cache.get(interaction.channelId);

		// Check to see if user is in 'cooldown'
		if (!client.cooldowns.has(interaction.commandName)) {
			client.cooldowns.set(interaction.commandName, new Collection());
		}

		const now = Date.now(),
			timestamps = client.cooldowns.get(interaction.commandName),
			cooldownAmount = (interaction.user.premium ? 2250 : 3000);

		if (timestamps.has(interaction.user.id)) {
			const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return interaction.reply({ embeds:[channel.error('events/message:COMMAND_COOLDOWN', { NUM: timeLeft.toFixed(1) }, true)], ephemeral: true });
			}
		}

		// Run context menu
		if (client.config.debug) client.logger.debug(`Context menu: ${interaction.commandName} was ran by ${interaction.user.displayName}.`);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

		switch (interaction.commandName) {
			case 'Avatar':
				client.commands.get('avatar').reply(client, interaction, channel, interaction.targetId);
				break;
			case 'Userinfo':
				if (interaction.commandName == 'Userinfo') client.commands.get('user-info').reply(client, interaction, channel, interaction.targetId);
				break;
			case 'Translate': {
				// Only allow this to show in server channels
				if (channel.type == ChannelType.DM) return interaction.reply({ embeds: [channel.error('events/message:GUILD_ONLY', {}, true)], ephemeral: true });

				// fetch message and check if message has content
				const message = await channel.messages.fetch(interaction.targetId);
				if (!message.content) return interaction.reply({ embeds: [channel.error('events/custom:NO_CONTENT', {}, true)], ephemeral: true });

				// translate message to server language
				try {
					const res = await client.fetch('info/translate', { text: message.content, lang: client.languages.find(lan => lan.name == guild.settings.Language).nativeName });

					interaction.reply({
						content: `Translated to \`${client.languages.find(lan => lan.name == guild.settings.Language).nativeName}\`: ${res}`,
						allowedMentions: { parse: [] },
					});
				} catch (err: any) {
					console.log(err: any);
					client.logger.error(`Command: 'Translate' has error: ${err.message}.`);
					interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
				}
				break;
			}
			case 'OCR': {
				await interaction.deferReply();

				// fetch message and check if message has attachments
				const message = await channel.messages.fetch(interaction.targetId);
				if (!message.attachments.first()?.url) return interaction.followUp({ embeds: [channel.error('events/custom:NO_ATTACH', {}, true)], ephemeral: true });

				// Get text from image
				const res = await client.fetch('misc/get-text', { url: message.attachments.first().url });

				// Make sure text was actually retrieved
				if (!res) return interaction.followUp({ embeds: [channel.error('events/custom:NO_TEXT_FROM_ATTACH', {}, true)], ephemeral: true });

				return interaction.followUp({ content: `Text from image: ${res}` });
			}
			case 'Add to Queue': {
				// Only allow this to show in server channels
				if (channel.type == ChannelType.DM) return interaction.reply({ embeds: [channel.error('events/message:GUILD_ONLY', {}, true)], ephemeral: true });

				const message = await channel.messages.fetch(interaction.targetId);
				const args = new Map().set('track', { value: message.content });
				client.commands.get('play').callback(client, interaction, guild, args);
				break;
			}
			case 'Screenshot': {
			// fetch message and check if message has content
				const message = await channel.messages.fetch(interaction.targetId);
				if (!message.content) return interaction.reply({ embeds: [channel.error('events/custom:NO_TRANS', {}, true)], ephemeral: true });

				client.commands.get('screenshot').reply(client, interaction, channel, message);
				break;
			}
			case 'Report': {
				const type = interaction.commandType == 3 ? 'message' : 'user';
				const modal = new ModalBuilder()
					.setCustomId(`type_${interaction.commandType == 3 ? `message_${interaction.targetMessage.id}` : `user_${interaction.targetUser.id}`}`)
					.setTitle(`Reporting ${type}`)
					.addComponents(
						new ActionRowBuilder()
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
				return interaction.showModal(modal);
			}
			default:
				interaction.reply({ content: 'Something went wrong' });
		}
		timestamps.set(interaction.user.id, now);
	}
}

