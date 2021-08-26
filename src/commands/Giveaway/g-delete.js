// Dependencies
const	Command = require('../../structures/Command.js');

/**
 * Giveaway delete command
 * @extends {Command}
*/
class GiveawayDelete extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor(bot) {
		super(bot, {
			name: 'g-delete',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['giveaway-delete', 'gdelete'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Delete a giveaway',
			usage: 'g-delete <messageID>',
			cooldown: 2000,
			examples: ['g-delete 818821436255895612'],
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
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('giveaway/g-delete:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
		}

		// Delete the giveaway
		const messageID = message.args[0];
		bot.giveawaysManager.delete(messageID).then(() => {
			message.channel.send(bot.translate('giveaway/g-delete:SUCCESS_GIVEAWAY'));
		}).catch((err) => {
			bot.logger.error(`Command: 'g-delete' has error: ${err.message}.`);
			message.channel.send(bot.translate('giveaway/g-delete:UNKNOWN_GIVEAWAY', { ID: messageID }));
		});
	}
}

module.exports = GiveawayDelete;
