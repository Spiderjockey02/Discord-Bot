// Dependencies
const { MessageEmbed } = require('discord.js'),
	delay = ms => new Promise(res => setTimeout(res, ms)),
	Command = require('../../structures/Command.js');

module.exports = class Clear extends Command {
	constructor(bot) {
		super(bot, {
			name: 'clear',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['cl', 'purge'],
			userPermissions: ['MANAGE_MESSAGES'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_MESSAGES'],
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

		// Make sure user can delete messages themselves
		if (!message.channel.permissionsFor(message.author).has('MANAGE_MESSAGES')) return message.channel.error(settings.Language, 'USER_PERMISSION', 'MANAGE_MESSAGES').then(m => m.delete({ timeout: 10000 }));

		// Make sure bot can delete other peoples messages
		if (!message.channel.permissionsFor(bot.user).has('MANAGE_MESSAGES')) {
			bot.logger.error(`Missing permission: \`MANAGE_MESSAGES\` in [${message.guild.id}].`);
			return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'MANAGE_MESSAGES').then(m => m.delete({ timeout: 10000 }));
		}

		// Make sure the bot can see other peoples' messages
		if (!message.channel.permissionsFor(bot.user).has('READ_MESSAGE_HISTORY')) {
			bot.logger.error(`Missing permission: \`READ_MESSAGE_HISTORY\` in [${message.guild.id}].`);
			return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'READ_MESSAGE_HISTORY').then(m => m.delete({ timeout: 10000 }));
		}

		// Get number of messages to removed
		const amount = message.args[0];

		// Make something was entered after `!clear`
		if (!amount) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/clear:USAGE')) }).then(m => m.delete({ timeout: 5000 }));

		// Make sure x is a number
		if (isNaN(amount) || (amount > 1000) || (amount < 1)) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/clear:USAGE')) }).then(m => m.delete({ timeout: 5000 }));

		// make sure guild is premium if amount > 200
		if (amount > 200 && !message.guild.premium) return message.channel.send('The server must be premium in order to clear more than `200` messages.');

		// Confirmation for message deletion over 100
		if (amount >= 100) {
			const embed = new MessageEmbed()
				.setTitle('Clear Message Confirmation')
				.setDescription(`You are about to clear ${amount} messages from this channel, please react to confirm this action.`)
				.setTimestamp();

			message.channel.send(embed).then(async confirmationMessage => {
				// React to message
				await confirmationMessage.react('✅');

				// filter
				const filter = (reaction, user) => {
					return reaction.emoji.name === '✅' && user.id === message.author.id;
				};

				// Collect the reactions
				const collector = confirmationMessage.createReactionCollector(filter, { time: 15000 });
				collector.on('collect', async () => {
					let x = amount, y = 0;
					while (x !== 0) {
						try {
							let messages = await message.channel.messages.fetch({ limit: x > 100 ? 100 : x });
							// Delete user messages
							if (message.args[1]) {
								const member = message.getMember();
								messages = messages.filter((m) => m.author.id == member[0].user.id);
							}

							// delete the message
							const delMessages = await message.channel.bulkDelete(messages, true).catch(err => bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`));
							y += delMessages.size;
							x = x - messages.size;
							await delay(5000);
						} catch (e) {
							break;
						}
					}
					message.channel.success(settings.Language, 'MODERATION/MESSAGES_DELETED', y).then(m => m.delete({ timeout: 3000 }));
				});

				// The user did not respond in time
				collector.on('end', async () => {
					await confirmationMessage.reactions.removeAll();
					embed.setDescription('Confirmation timed-out.');
					confirmationMessage.edit(embed);
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
				message.channel.success(settings.Language, 'MODERATION/MESSAGES_DELETED', messages.size).then(m => m.delete({ timeout: 3000 }));
			});
		}
	}
};
