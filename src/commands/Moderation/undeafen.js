// Dependencies
const	Command = require('../../structures/Command.js');

module.exports = class Undeafen extends Command {
	constructor(bot) {
		super(bot, {
			name: 'undeafen',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['undeaf', 'un-deafen'],
			userPermissions: ['DEAFEN_MEMBERS'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'DEAFEN_MEMBERS'],
			description: 'Undeafen a user.',
			usage: 'undeafen <user>',
			cooldown: 2000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Check if user has deafen permission
		if (!message.member.hasPermission('DEAFEN_MEMBERS')) return message.error(settings.Language, 'USER_PERMISSION', 'DEAFEN_MEMBERS').then(m => m.delete({ timeout: 10000 }));

		// Check if bot has permission to ban user
		if (!message.guild.me.hasPermission('DEAFEN_MEMBERS')) {
			bot.logger.error(`Missing permission: \`DEAFEN_MEMBERS\` in [${message.guild.id}].`);
			return message.error(settings.Language, 'MISSING_PERMISSION', 'DEAFEN_MEMBERS').then(m => m.delete({ timeout: 10000 }));
		}

		// Checks to make sure user is in the server
		const member = message.guild.getMember(message, args);

		try {
			await member[0].voice.setDeaf(false);
			message.success(settings.Language, 'MODERATION/SUCCESSFULL_UNDEAFEN', member[0].user).then(m => m.delete({ timeout: 3000 }));
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		}
	}
};
