// Dependencies
const	translate = require('@vitalets/google-translate-api'),
	optiic = new (require('optiic')),
	{ Collection } = require('discord.js'),
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
		const guild = bot.guilds.cache.get(interaction.guildId),
			channel = guild.channels.cache.get(interaction.channelId),
			member = guild.members.cache.get(interaction.user.id);

		// Check to see if user is in 'cooldown'
		if (!bot.cooldowns.has(interaction.commandName)) {
			bot.cooldowns.set(interaction.commandName, new Collection());
		}

		const now = Date.now(),
			timestamps = bot.cooldowns.get(interaction.commandName),
			cooldownAmount = (member.user.premium ? 2250 : 3000);

		if (timestamps.has(member.id)) {
			const expirationTime = timestamps.get(member.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return interaction.reply({ embeds:[channel.error('events/message:COMMAND_COOLDOWN', { NUM: timeLeft.toFixed(1) }, true)], ephemeral: true });
			}
		}

		// Run context menu
		if (bot.config.debug) bot.logger.debug(`Context menu: ${interaction.commandName} was ran by ${member.user.username}.`);
		setTimeout(() => timestamps.delete(member.id), cooldownAmount);


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
			try {
				const bar = await translate(message.content, { to: guild.settings.Language.split('-')[0] });
				interaction.reply({ content: `Translated to \`English\`: ${bar.text}` });
			} catch (err) {
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				interaction.reply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
			}
			break;
		}
		case 'OCR': {
			// fetch message and check if message has attachments
			const message = await channel.messages.fetch(interaction.targetId);
			if (!message.attachments.first()?.url) return interaction.reply({ embeds: [channel.error('That message had no attachments', {}, true)], ephemeral: true });

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
			bot.commands.get('play').callback(bot, interaction, guild, args);
			break;
		}
		default:
			interaction.reply({ content: 'Something went wrong' });
		}
		timestamps.set(member.id, now);
	}
}

module.exports = ClickMenu;
