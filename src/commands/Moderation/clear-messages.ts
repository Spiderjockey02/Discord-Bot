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
			name: 'clear-messages',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['cl', 'purge'],
			userPermissions: [Flags.ManageMessages],
			botPermissions: [Flags.SendMessages, Flags.EmbedLinks, Flags.ReadMessageHistory, Flags.ManageMessages],
			description: 'Clear a certain amount of messages.',
			usage: 'clear <Number> [member]',
			cooldown: 5000,
			examples: ['clear 50 username', 'clear 10'],
			slash: false,
			isSubCmd: true,
			options: [
				{
					name: 'number',
					description: 'The number of messages to delete.',
					type: ApplicationCommandOptionType.Integer,
					minValue: 1,
					maxValue: 1000,
					required: true,
				},
				{
					name: 'user',
					description: 'Only delete messages from this user.',
					type: ApplicationCommandOptionType.User,
					required: false,
				},
				{
					name: 'flag',
					description: 'Show how many messages were deleted.',
					type: ApplicationCommandOptionType.String,
					choices: ['-show'].map(i => ({ name: i, value: i })),
				},
			],
		});
	}

	/**
	 * Function for receiving interaction.
	 * @param {bot} bot The instantiating client
	 * @param {interaction} interaction The interaction that ran the command
	 * @param {guild} guild The guild the interaction ran in
	 * @param {args} args The options provided in the command, if any
	 * @readonly
	*/
	async callback(bot, interaction, guild, args) {
		const member = guild.members.cache.get(args.get('user')?.value),
			channel = guild.channels.cache.get(interaction.channelId),
			amount = args.get('number').value;

		// make sure guild is premium if amount > 200
		if (amount > 200 && !guild.premium) return interaction.reply({ embeds: [channel.error('moderation/clear:NO_PREM', null, true)] });

		// Confirmation for message deletion over 100
		if (amount >= 100) {
			const embed = new Embed(bot, guild)
				.setTitle(guild.translate('moderation/clear:TITLE'))
				.setDescription(guild.translate('moderation/clear:DESC', { NUM: amount }));

			// create the buttons
			const row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('success')
						.setLabel('Confirm')
						.setStyle(ButtonStyle.Success)
						.setEmoji(channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['checkmark'] : '✅'),
				)
				.addComponents(
					new ButtonBuilder()
						.setCustomId('cancel')
						.setLabel('Cancel')
						.setStyle(ButtonStyle.Danger)
						.setEmoji(channel.checkPerm('USE_EXTERNAL_EMOJIS') ? bot.customEmojis['cross'] : '❌'),
				);

			// Send confirmation message
			await interaction.reply({ embeds: [embed], components: [row], fetchReply: true }).then(async msg => {
				// create collector
				const collector = msg.createMessageComponentCollector({ filter: (i) => ['cancel', 'success'].includes(i.customId) && i.user.id === interaction.user.id, time: 15000 });

				// A button was clicked
				collector.on('collect', async i => {
					// User pressed cancel button
					if (i.customId === 'cancel') {
						embed.setDescription(guild.translate('moderation/clear:CON_CNC'));
						return msg.edit({ embeds: [embed], components: [] });
					} else {
						// Delete the messages
						await i.reply(guild.translate('moderation/clear:DEL_MSG', { TIME: Math.ceil(amount / 100) * 5, NUM: amount }));
						await bot.delay(5000);

						let x = 0, y = 0;
						const z = amount;
						while (x !== Math.ceil(amount / 100)) {
							try {
								let messages = await channel.messages.fetch({ limit: z > 100 ? 100 : z });
								// Delete user messages
								if (member) {
									messages = messages.filter((m) => m.author.id == member[0].user.id);
								}

								// delete the message
								const delMessages = await channel.bulkDelete(messages, true).catch(err => bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`));
								y += delMessages.size;
								x++;
								await bot.delay(5000);
							} catch (e) {
								x = Math.ceil(amount / 100);
							}
						}
						return interaction.reply({ embeds: [channel.success('moderation/clear:SUCCESS', { NUM: y }, true)] });
					}
				});

				// user did not react in time
				collector.on('end', async () => {
					if (msg.deleted) return;
					if (embed.description == guild.translate('moderation/clear:CON_CNC')) {
						await msg.delete();
					} else {
						embed.setDescription(guild.translate('moderation/clear:CON_TO'));
						await msg.edit({ embeds: [embed], components: [] });
					}
				});
			});
		} else {
			// Delete messages (less than 100)
			await channel.messages.fetch({ limit: amount }).then(async messages => {
				// Delete user messages
				if (member) messages = messages.filter((m) => m.author.id == member[0].user.id);

				// delete the message
				await channel.bulkDelete(messages, true).catch(err => bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`));
				interaction.reply({ embeds: [channel.success('moderation/clear:SUCCESS', { NUM: messages.size }, true)] });
			});
		}
	}
}

module.exports = Clear;
