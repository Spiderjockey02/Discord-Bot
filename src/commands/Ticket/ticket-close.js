// Dependencies
const Command = require('../../structures/Command.js');

/**
 * Ticket close command
 * @extends {Command}
*/
class TicketClose extends Command {
	/**
 * @param {Client} client The instantiating client
 * @param {CommandData} data The data for the command
*/
	constructor(bot) {
		super(bot, {
			name: 'ticket-close',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['t-close'],
			userPermissions: ['MANAGE_CHANNELS'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_CHANNELS'],
			description: 'Closes the current ticket channel',
			usage: 'ticket-close',
			cooldown: 3000,
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
		// will close the current ticket channel
		const regEx = /ticket-\d{18}/g;
		if (regEx.test(message.channel.name)) {
			try {
				if (message.member.roles.cache.get(settings.TicketSupportRole) || message.member.permissionsIn(message.channel).has('MANAGE_CHANNELS')) {
					// delete channel
					await message.channel.delete();
				} else {
					return message.channel.error('ticket/ticket-close:NOT_SUPPORT');
				}
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}
		} else {
			message.channel.error('ticket/ticket-close:NOT_TICKET').then(m => m.timedDelete({ timeout: 5000 }));
		}
	}
}

module.exports = TicketClose;
