// Dependencies
const Command = require('../../structures/Command.js');

module.exports = class TicketClose extends Command {
	constructor(bot) {
		super(bot, {
			name: 'ticket-close',
			dirname: __dirname,
			aliases: ['t-close'],
			userPermissions: ['MANAGE_CHANNELS'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_CHANNELS'],
			description: 'Closes the current ticket channel',
			usage: 'ticket-close',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, settings) {
		// will close the current ticket channel
		const regEx = /ticket-\d{18}/g;
		if (regEx.test(message.channel.name)) {
			try {
				if (message.member.roles.cache.get(settings.TicketSupportRole) || message.member.permissionsIn(message.channel).has('MANAGE_CHANNELS')) {
					// Make sure bot has permission to delete channel
					if (!message.guild.me.hasPermission('MANAGE_CHANNELS')) {
						bot.logger.error(`Missing permission: \`MANAGE_CHANNELS\` in [${message.guild.id}].`);
						return message.channel.error(settings.Language, 'MISSING_PERMISSION', 'MANAGE_CHANNELS').then(m => m.delete({ timeout: 10000 }));
					}

					// delete channel
					await message.channel.delete();
				} else {
					return message.channel.error(settings.Language, 'TICKET/NOT_SUPPORT');
				}
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
			}
		} else {
			message.channel.error(settings.Language, 'TICKET/NOT_TICKET').then(m => m.delete({ timeout: 5000 }));
		}
	}
};
