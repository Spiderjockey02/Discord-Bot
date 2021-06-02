// Dependencies
const { WarningSchema } = require('../../database/models'),
	Command = require('../../structures/Command.js');

module.exports = class ClearWarning extends Command {
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

	// Run command
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Get user
		const members = await message.getMember();

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
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
