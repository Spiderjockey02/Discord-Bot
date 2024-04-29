// Dependencies
const	{ Collection, ModalBuilder, TextInputStyle, TextInputBuilder, ActionRowBuilder } = require('discord.js'),
	{ ChannelType } = require('discord-api-types/v10'),
	Event = require('../../structures/Event');

/**
 * click menu event
 * @event Egglord#ClickMenu
 * @extends {Event}
*/
class ClickMenu extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {CommandInteraction} interaction The context menu clicked
	 * @readonly
	*/
	async run(bot, interaction) {
		const guild = bot.guilds.cache.get(interaction.guildId),
			channel = bot.channels.cache.get(interaction.channelId);

		// Check to see if user is in 'cooldown'
		if (!bot.cooldowns.has(interaction.commandName)) {
			bot.cooldowns.set(interaction.commandName, new Collection());
		}

		const now = Date.now(),
			timestamps = bot.cooldowns.get(interaction.commandName),
			cooldownAmount = (interaction.user.premium ? 2250 : 3000);

		if (timestamps.has(interaction.user.id)) {
			const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return interaction.reply({ embeds:[channel.error('events/message:COMMAND_COOLDOWN', { NUM: timeLeft.toFixed(1) }, true)], ephemeral: true });
			}
		}

		// Run context menu
		if (bot.config.debug) bot.logger.debug(`Context menu: ${interaction.commandName} was ran by ${interaction.user.displayName}.`);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

		switch (interaction.commandName) {
			case 'Avatar':
				bot.commands.get('avatar').reply(bot, interaction, channel, interaction.targetId);
				break;
			case 'Userinfo':
				if (interaction.commandName == 'Userinfo') bot.commands.get('user-info').reply(bot, interaction, channel, interaction.targetId);
				break;
			case 'Translate': {
				// Only allow this to show in server channels
				if (channel.type == ChannelType.DM) return interaction.reply({ embeds: [channel.error('events/message:GUILD_ONLY', {}, true)], ephemeral: true });

				// fetch message and check if message has content
				const message = await channel.messages.fetch(interaction.targetId);
				if (!message.content) return interaction.reply({ embeds: [channel.error('events/custom:NO_CONTENT', {}, true)], ephemeral: true });

				// translate message to server language
				try {
					const res = await bot.fetch('info/translate', { text: message.content, lang: bot.languages.find(lan => lan.name == guild.settings.Language).nativeName });

					interaction.reply({
						content: `Translated to \`${bot.languages.find(lan => lan.name == guild.settings.Language).nativeName}\`: ${res}`,
						allowedMentions: { parse: [] },
					});
				} catch (err) {
					console.log(err);
					bot.logger.error(`Command: 'Translate' has error: ${err.message}.`);
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
				const res = await bot.fetch('misc/get-text', { url: message.attachments.first().url });

				// Make sure text was actually retrieved
				if (!res) return interaction.followUp({ embeds: [channel.error('events/custom:NO_TEXT_FROM_ATTACH', {}, true)], ephemeral: true });

				return interaction.followUp({ content: `Text from image: ${res}` });
			}
			case 'Add to Queue': {
				// Only allow this to show in server channels
				if (channel.type == ChannelType.DM) return interaction.reply({ embeds: [channel.error('events/message:GUILD_ONLY', {}, true)], ephemeral: true });

				const message = await channel.messages.fetch(interaction.targetId);
				const args = new Map().set('track', { value: message.content });
				bot.commands.get('play').callback(bot, interaction, guild, args);
				break;
			}
			case 'Screenshot': {
			// fetch message and check if message has content
				const message = await channel.messages.fetch(interaction.targetId);
				if (!message.content) return interaction.reply({ embeds: [channel.error('events/custom:NO_TRANS', {}, true)], ephemeral: true });

				bot.commands.get('screenshot').reply(bot, interaction, channel, message);
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

module.exports = ClickMenu;
