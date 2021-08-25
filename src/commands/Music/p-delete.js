// Dependencies
const { PlaylistSchema } = require('../../database/models'),
	Command = require('../../structures/Command.js');

/**
 * playlist delete command
 * @extends {Command}
*/
class PDelete extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'p-delete',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['playlist-delete'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Delete a playlist',
			usage: 'p-delete <playlist name>',
			cooldown: 3000,
			examples: ['p-delete Songs'],
		});
	}

	/**
 	 * Function for recieving message.
 	 * @param {bot} bot The instantiating client
 	 * @param {message} message The message that ran the command
 	 * @readonly
  */
	async run(bot, message, settings) {
		// Make sure a playlist name was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('music/p-delete:USAGE')) }).then(m => m.timedDelete({ timeout: 5000 }));

		// Find and then delete playlist if it exists
		PlaylistSchema.findOne({
			name: message.args[0],
			creator: message.author.id,
		}, async (err, p) => {
			// if an error occured
			if (err) {
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			}

			if (!p) {
				message.channel.error('music/p-delete:MISSING', { TITLE: message.args[0] });
			} else {
				try {
					await PlaylistSchema.findOneAndRemove({ name: message.args[0],	creator: message.author.id });
					message.channel.success('music/p-delete:SUCCESS', { TITLE: message.args[0] });
				} catch (err) {
					if (message.deletable) message.delete();
					bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
					message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
				}
			}
		});
	}
}

module.exports = PDelete;
