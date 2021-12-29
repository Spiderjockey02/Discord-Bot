// Dependencies
const { Embed } = require('../../utils'),
	{ MessageButton, MessageActionRow } = require('discord.js'),
	Command = require('../../structures/Command.js');

/**
 * Clear command
 * @extends {Command}
*/
class Clear extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'clear',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['cl', 'purge'],
			userPermissions: ['MANAGE_MESSAGES'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'READ_MESSAGE_HISTORY', 'MANAGE_MESSAGES'],
			description: 'Clear a certain amount of messages.',
			usage: 'clear <Number> [member]',
			cooldown: 5000,
			examples: ['clear 50 username', 'clear 10'],
		});
	}

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @param {settings} settings The settings of the channel the command ran in
 	 * @readonly
	*/
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle && message.deletable) message.delete();

		// Get number of messages to removed
		const amount = message.args[0];

		// Make something was entered after `!clear`
		if (!amount) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/clear:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// Make sure x is a number
		if (isNaN(amount) || (amount > 1000) || (amount < 1)) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/clear:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// make sure guild is premium if amount > 200
		if (amount > 200 && !message.guild.premium) return message.channel.error('moderation/clear:NO_PREM');

		// Confirmation for message deletion over 100
		if (amount >= 100) {
			const embed = new Embed(bot, message.guild)
				.setTitle(message.translate('moderation/clear:TITLE'))
				.setDescription(message.translate('moderation/clear:DESC', { NUM: amount }));

			// create the buttons
			const row = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('success')
						.setLabel('Confirm')
						.setStyle('SUCCESS')
						.setEmoji(message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['checkmark'] : '✅'),
				)
				.addComponents(
					new MessageButton()
						.setCustomId('cancel')
						.setLabel('Cancel')
						.setStyle('DANGER')
						.setEmoji(message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['cross'] : '❌'),
				);

			// Send confirmation message
			await message.channel.send({ embeds: [embed], components: [row] }).then(async msg => {
				// create collector
				const filter = (i) => ['cancel', 'success'].includes(i.customId) && i.user.id === message.author.id;
				const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

				// A button was clicked
				collector.on('collect', async i => {
					// User pressed cancel button
					if (i.customId === 'cancel') {
						embed.setDescription(message.translate('moderation/clear:CON_CNC'));
						return msg.edit({ embeds: [embed], components: [] });
					} else {
						// Delete the messages
						await i.reply(message.translate('moderation/clear:DEL_MSG', { TIME: Math.ceil(amount / 100) * 5, NUM: amount }));
						await bot.delay(5000);

						let x = 0, y = 0;
						const z = amount;
						while (x !== Math.ceil(amount / 100)) {
							try {
								let messages = await message.channel.messages.fetch({ limit: z > 100 ? 100 : z });
								// Delete user messages
								if (message.args[1]) {
									const member = await message.getMember();
									messages = messages.filter((m) => m.author.id == member[0].user.id);
								}

								// delete the message
								const delMessages = await message.channel.bulkDelete(messages, true).catch(err => bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`));
								y += delMessages.size;
								x++;
								await bot.delay(5000);
							} catch (e) {
								x = Math.ceil(amount / 100);
							}
						}
						return message.channel.success('moderation/clear:SUCCESS', { NUM: y }).then(m => m.timedDelete({ timeout: 3000 }));
					}
				});

				// user did not react in time
				collector.on('end', async () => {
					if (msg.deleted) return;
					if (embed.description == message.translate('moderation/clear:CON_CNC')) {
						await msg.delete();
					} else {
						embed.setDescription(message.translate('moderation/clear:CON_TO'));
						await msg.edit({ embeds: [embed], components: [] });
					}
				});
			});
		} else {
			// Delete messages (less than 100)
			await message.channel.messages.fetch({ limit: amount }).then(async messages => {
				// Delete user messages
				if (message.args[1]) {
					const member = await message.getMember();
					messages = messages.filter((m) => m.author.id == member[0].user.id);
				}

				// delete the message
				await message.channel.bulkDelete(messages, true).catch(err => bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`));
				message.channel.success('moderation/clear:SUCCESS', { NUM: messages.size }).then(m => m.timedDelete({ timeout: 3000 }));
			});
		}
	}
}

module.exports = Clear;
