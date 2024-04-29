// Dependencies
const { Embed } = require('../../utils'),
	{ ActionRowBuilder, ButtonBuilder, ButtonStyle, ApplicationCommandOptionType, PermissionsBitField: { Flags } } = require('discord.js'),
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
			userPermissions: [Flags.ManageMessages],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ReadMessageHistory, Flags.ManageMessages],
			description: 'Clear a certain amount of messages.',
			usage: 'clear <Number> [member]',
			cooldown: 5000,
			examples: ['clear 50 username', 'clear 10'],
			slash: true,
			options: bot.subCommands.filter(c => c.help.name.startsWith('clear-')).map(c => ({
				name: c.help.name.replace('clear-', ''),
				description: c.help.description,
				type: ApplicationCommandOptionType.Subcommand,
				options: c.conf.options,
			})),
		});
	}

	/**
 	 * Function for receiving message.
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
		if (!amount) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/clear:USAGE')) });

		// Make sure x is a number
		if (isNaN(amount) || (amount > 1000) || (amount < 1)) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/clear:USAGE')) });

		// make sure guild is premium if amount > 200
		if (amount > 200 && !message.guild.premium) return message.channel.error('moderation/clear:NO_PREM');

		// Confirmation for message deletion over 100
		if (amount >= 100) {
			const embed = new Embed(bot, message.guild)
				.setTitle(message.translate('moderation/clear:TITLE'))
				.setDescription(message.translate('moderation/clear:DESC', { NUM: amount }));

			// create the buttons
			const row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('success')
						.setLabel('Confirm')
						.setStyle(ButtonStyle.Success)
						.setEmoji(message.channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['checkmark'] : '✅'),
				)
				.addComponents(
					new ButtonBuilder()
						.setCustomId('cancel')
						.setLabel('Cancel')
						.setStyle(ButtonStyle.Danger)
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

	/**
	 * Function for receiving interaction.
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const command = bot.subCommands.get(`clear-${interaction.options.getSubcommand()}`);
		if (command) {
			command.callback(bot, interaction, guild, args);
		} else {
			interaction.reply({ content: 'Error', ephemeral: true });
		}
	}
}

module.exports = Clear;
