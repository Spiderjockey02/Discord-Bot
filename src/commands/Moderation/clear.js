// Dependencies
const { Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Clear extends Command {
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

	// Run command
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Get number of messages to removed
		const amount = message.args[0];

		// Make something was entered after `!clear`
		if (!amount) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/clear:USAGE')) }).then(m => m.delete({ timeout: 5000 }));

		// Make sure x is a number
		if (isNaN(amount) || (amount > 1000) || (amount < 1)) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/clear:USAGE')) }).then(m => m.delete({ timeout: 5000 }));

		// make sure guild is premium if amount > 200
		if (amount > 200 && !message.guild.premium) return message.channel.error('moderation/clear:NO_PREM');

		// Confirmation for message deletion over 100
		if (amount >= 100) {
			const embed = new Embed(bot, message.guild)
				.setTitle(message.translate('moderation/clear:TITLE'))
				.setDescription(message.translate('moderation/clear:DESC', { NUM: amount }));

			message.channel.send(embed).then(async msg => {
				// React to message
				await msg.react(message.checkEmoji() ? bot.customEmojis['checkmark'] : '✅');
				await msg.react(message.checkEmoji() ? bot.customEmojis['cross'] : '❌');

				// filter
				const filter = (reaction, user) => {
					return [bot.customEmojis['checkmark'], '✅', bot.customEmojis['cross'], '❌'].includes(reaction.emoji.toString()) && user.id === message.author.id;
				};

				// Collect the reactions
				const collector = msg.createReactionCollector(filter, { time: 15000 });
				collector.on('collect', async (reaction) => {
					if ([bot.customEmojis['checkmark'], '✅'].includes(reaction.emoji.toString())) {
						// send message telling users not to send messages
						await message.channel.send(message.translate('moderation/clear:DEL_MSG', { TIME: Math.ceil(amount / 100) * 5, NUM: amount }));
						await bot.delay(5000);

						let x = 0, y = 0;
						const z = amount;
						while (x !== Math.ceil(amount / 100)) {
							try {
								let messages = await message.channel.messages.fetch({ limit: z > 100 ? 100 : z });
								// Delete user messages
								if (message.args[1]) {
									const member = message.getMember();
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
						message.channel.success('moderation/clear:SUCCESS', { NUM: y }).then(m => m.delete({ timeout: 3000 }));
					} else if ([bot.customEmojis['cross'], '❌'].includes(reaction.emoji.toString())) {
						await msg.reactions.removeAll();
						embed.setDescription(message.translate('moderation/clear:CON_CNC'));
						msg.edit(embed);
					}
				});

				// The user did not respond in time
				collector.on('end', async () => {
					if (embed.description == message.translate('moderation/clear:CON_CNC')) {
						await msg.delete();
					} else {
						await msg.reactions.removeAll();
						embed.setDescription(message.translate('moderation/clear:CON_TO'));
						await msg.edit(embed);
					}
				});
			});
		} else {
			// Delete messages (less than 100)
			await message.channel.messages.fetch({ limit: amount }).then(async messages => {
				// Delete user messages
				if (message.args[1]) {
					const member = message.getMember();
					messages = messages.filter((m) => m.author.id == member[0].user.id);
				}

				// delete the message
				await message.channel.bulkDelete(messages, true).catch(err => bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`));
				message.channel.success('moderation/clear:SUCCESS', { NUM: messages.size }).then(m => m.delete({ timeout: 3000 }));
			});
		}
	}
};
