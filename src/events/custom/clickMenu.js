// Dependencies
const	translate = require('@vitalets/google-translate-api'),
	optiic = new (require('optiic')),
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
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {CommandInteraction} interaction The context menu clicked
	 * @readonly
	*/
	async run(bot, interaction) {
		const channel = bot.channels.cache.get(interaction.channelId);

		switch (interaction.commandName) {
		case 'Avatar':
			bot.commands.get('avatar').reply(bot, interaction, channel, interaction.targetId);
			break;
		case 'Userinfo':
			if (interaction.commandName == 'Userinfo') bot.commands.get('user-info').reply(bot, interaction, channel, interaction.targetId);
			break;
		case 'Translate': {
			// fetch message and check if message has content
			const message = await channel.messages.fetch(interaction.targetId);
			if (!message.content) return interaction.reply({ embeds: [channel.error('There is no content on this message for me to translate.', {}, true)], ephemeral: true });

			// translate message to server language
			const bar = await translate(message.content, { to: 'en' });
			interaction.reply({ content: `Translate to \`English\`: ${bar.text}` });
			break;
		}
		case 'OCR': {
			// fetch message and check if message has attachments
			const message = await channel.messages.fetch(interaction.targetId);
			if (!message.attachments.first().url) return interaction.reply({ embeds: [channel.error('That message had no attachments', {}, true)], ephemeral: true });

			// Get text from image
			const res = await optiic.process({
				image: message.attachments.first().url,
				mode: 'ocr',
			});

			// Make sure text was actually retrieved
			if (!res.text) {
				interaction.reply({ embeds: [channel.error('No text was found from the attachment.', {}, true)], ephemeral: true });
			} else {
				interaction.reply({ content: `Text from image: ${res.text}` });
			}
			break;
		}
		case 'Add to Queue': {
			const message = await channel.messages.fetch(interaction.targetId);
			const args = new Map().set('track', { value: message.content });
			bot.commands.get('play').callback(bot, interaction, channel.guild, args);
			break;
		}
		default:

		}
	}
}

module.exports = ClickMenu;
