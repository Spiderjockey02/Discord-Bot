// Dependencies
const { Warning } = require('../../modules/database/models/index');

module.exports.run = async (bot, message, args, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();

	// Check to see if user can kick members
	if (!message.member.hasPermission('KICK_MEMBERS')) return message.error(settings.Language, 'USER_PERMISSION', 'KICK_MEMBERS').then(m => m.delete({ timeout: 10000 }));

	// Get user
	const member = bot.getUsers(message, args);

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
		if (bot.config.debug) bot.logger.error(`${err.message} - command: clear-warnings.`);
		message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
	}
};

module.exports.config = {
	command: 'clear-warning',
	aliases: ['cl-warning', 'cl-warnings', 'clear-warnings'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Clear warnings',
	category: 'Moderation',
	description: 'Remove warnings from a user.',
	usage: '${PREFIX}clear-warning <user>',
	example: '${PREFIX}clear-warning @NaughtyPerson',
};
