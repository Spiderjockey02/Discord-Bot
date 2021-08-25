// Dependencies
const { WarningSchema } = require('../../database/models'),
	Command = require('../../structures/Command.js');

/**
 * ClearWarning command
 * @extends {Command}
*/
class ClearWarning extends Command {
	/**
 	 * @param {Client} client The instantiating client
 	 * @param {CommandData} data The data for the command
	*/
	constructor(bot) {
		super(bot, {
			name: 'clear-warning',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['cl-warning', 'cl-warnings', 'clear-warnings'],
			userPermissions: ['KICK_MEMBERS'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Remove warnings from a user.',
			usage: 'clear-warning <user> [warning number]',
			cooldown: 5000,
			examples: ['clear-warning username'],
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

		// check if a user was entered
		if (!message.args[0]) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/clear-warning:USAGE')) }).then(m => m.timedDelete({ timeout: 10000 }));


		// Get members mentioned in message
		const members = await message.getMember(false);

		// Make sure atleast a guildmember was found
		if (!members[0]) return message.channel.error('moderation/ban:MISSING_USER').then(m => m.timedDelete({ timeout: 10000 }));

		// get warnings of user
		try {
			// find data
			const warns = await WarningSchema.find({
				userID: members[0].user.id,
				guildID: message.guild.id,
			});

			// check if a warning number was entered
			if (message.args[1] - 1 <= warns.length) {
				// Delete item from database as bot didn't crash
				await WarningSchema.findByIdAndRemove(warns[message.args[1] - 1]._id);
			} else {
				await WarningSchema.deleteMany({ userID: members[0].user.id, guildID: message.guild.id });
			}
			message.channel.send(message.translate('moderation/clear-warning:CLEARED', { MEMBER: members[0] }));
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}
}

module.exports = ClearWarning;
