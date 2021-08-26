// Dependencies
const	Command = require('../../structures/Command.js');

/**
 * Giveaway reroll command
 * @extends {Command}
*/
class GiveawayReroll extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor(bot) {
		super(bot, {
			name: 'g-reroll',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['giveaway-reroll', 'greroll'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'reroll a giveaway.',
			usage: 'g-reroll <messageID> [winners]',
			cooldown: 2000,
			examples: ['g-reroll 818821436255895612'],
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

		// Make sure the message ID of the giveaway embed is entered
		if (!message.args[0]) {
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('giveaway/g-reroll:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
		}

		// re-roll the giveaway
		const messageID = message.args[0];
		bot.giveawaysManager.reroll(messageID, {
			winnerCount: !parseInt(message.args[1]) ? bot.giveawaysManager.giveaways.find(g => g.messageID == messageID)?.winnerCount : parseInt(message.args[1]),
			messages: {
				congrat: message.translate('giveaway/g-reroll:CONGRAT'),
				error: message.translate('giveaway/g-reroll:ERROR'),
			},
		}).then(() => {
			message.channel.send(bot.translate('giveaway/g-reroll:SUCCESS_GIVEAWAY'));
		}).catch((err) => {
			bot.logger.error(`Command: 'g-reroll' has error: ${err.message}.`);
			message.channel.send(bot.translate('giveaway/g-reroll:UNKNOWN_GIVEAWAY', { ID: messageID }));
		});
	}
}

module.exports = GiveawayReroll;
