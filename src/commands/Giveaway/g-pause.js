// Dependencies
const	Command = require('../../structures/Command.js');

/**
 * Giveaway pause command
 * @extends {Command}
*/
class GiveawayPause extends Command {
	/**
   * @param {Client} client The instantiating client
   * @param {CommandData} data The data for the command
  */
	constructor(bot) {
		super(bot, {
			name: 'g-pause',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['giveaway-pause', 'gpause'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Pause a giveaway',
			usage: 'g-pause <messageID>',
			cooldown: 2000,
			examples: ['g-pause 818821436255895612'],
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
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('giveaway/g-pause:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));
		}

		// Delete the giveaway
		const messageID = message.args[0];
		bot.giveawaysManager.pause(messageID).then(() => {
			message.channel.send(bot.translate('giveaway/g-pause:SUCCESS_GIVEAWAY'));
		}).catch((err) => {
			bot.logger.error(`Command: 'g-delete' has error: ${err}.`);
			message.channel.send(bot.translate('giveaway/g-pause:UNKNOWN_GIVEAWAY', { ID: messageID }));
		});
	}
}

module.exports = GiveawayPause;
