// Dependencies
const Command = require('../../structures/Command.js');

/**
 * Update command
 * @extends {Command}
*/
class Update extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'update',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Updates the bots username + avatar',
			usage: 'update <username | avatar> <input>',
			cooldown: 600000,
			examples: ['update username Egglordv2'],
		});
	}

	/**
	 * Function for receiving message.
	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
	*/
	async run(bot, message, settings) {
		// Make sure something is entered to search on djs website
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('host/update:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		switch (message.args[0]) {
		case 'username':
			try {
				await bot.user.setUsername(message.args.join(''));
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}
			break;
		case 'avatar': {
			try {
				const file = message.attachments.first();
				if (!file) return message.channel.send({ content: 'Please upload an image with the command!' }).then(m => m.timedDelete({ timeout: 5000 }));
				await bot.user.setAvatar(file);
			} catch (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}
			break;
		}
		default:
			message.channel.send({ content: 'incorrect input' });
		}
	}
}

module.exports = Update;
