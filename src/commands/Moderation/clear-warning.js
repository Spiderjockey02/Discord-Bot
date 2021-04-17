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

		// Check to see if user can kick members
		if (!message.member.hasPermission('KICK_MEMBERS')) return message.channel.error(settings.Language, 'USER_PERMISSION', 'KICK_MEMBERS').then(m => m.delete({ timeout: 10000 }));

		// Get user
		const member = message.getMember();

		// get warnings of user
		try {
			// find data
			const warns = await WarningSchema.find({
				userID: member[0].user.id,
				guildID: message.guild.id,
			});

			// check if a warning number was entered
			if (message.args[1] - 1 <= warns.length) {
				// Delete item from database as bot didn't crash
				await WarningSchema.findByIdAndRemove(warns[message.args[1] - 1]._id);
			} else {
				await WarningSchema.deleteMany({ userID: member[0].user.id, guildID: message.guild.id });
			}
			message.channel.send(`warnings updated for ${member[0]}`);
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
