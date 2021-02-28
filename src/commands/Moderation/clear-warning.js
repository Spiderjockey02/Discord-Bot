// Dependencies
const { Warning } = require('../../modules/database/models/index'),
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
			usage: 'clear-warning <user>',
			cooldown: 5000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Check to see if user can kick members
		if (!message.member.hasPermission('KICK_MEMBERS')) return message.error(settings.Language, 'USER_PERMISSION', 'KICK_MEMBERS').then(m => m.delete({ timeout: 10000 }));

		// Get user
		const member = message.guild.getMember(message, args);

		// get warnings of user
		try {
			// find data
			const data = await Warning.findOne({
				userID: member[0].id,
				guildID: message.guild.id,
			});

			// Delete the data
			if (data) {
				await Warning.deleteOne(data, function(err) {
					if (err) throw err;
				});
				message.success(settings.Language, 'MODERATION/CLEARED_WARNINGS', member[0]).then(m => m.delete({ timeout: 10000 }));
			} else {
				message.sendT(settings.Language, 'MODERATION/NO_WARNINGS').then(m => m.delete({ timeout: 3500 }));
			}
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		}
	}
};
