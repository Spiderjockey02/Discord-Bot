// Dependencies
const Command = require('../../structures/Command.js');

module.exports = class Nick extends Command {
	constructor(bot) {
		super(bot, {
			name: 'nick',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['nickname', 'setnick'],
			userPermissions: ['CHANGE_NICKNAME', 'MANAGE_NICKNAMES'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_NICKNAMES'],
			description: 'Change the nickname of a user.',
			usage: 'nick <user> <name>',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Get user for nickname change
		const member = message.guild.getMember(message, args);

		// Check if they are changing their own name or not (and check permission)
		if (member[0] == message.member) {
			if (!message.member.hasPermission('CHANGE_NICKNAMES')) {
				return message.error(settings.Language, 'USER_PERMISSION', 'CHANGE_NICKNAMES').then(m => m.delete({ timeout: 10000 }));
			}
		} else if (!message.member.hasPermission('MANAGE_NICKNAMES')) {
			return message.error(settings.Language, 'USER_PERMISSION', 'MANAGE_NICKNAMES').then(m => m.delete({ timeout: 10000 }));
		}

		// Make sure the bot can change other user's nicknames
		if (!message.guild.me.hasPermission('MANAGE_NICKNAMES')) {
			bot.logger.error(`Missing permission: \`MANAGE_NICKNAMES\` in [${message.guild.id}].`);
			return message.error(settings.Language, 'MISSING_PERMISSION', 'MANAGE_NICKNAMES').then(m => m.delete({ timeout: 10000 }));
		}

		// Make sure user user does not have ADMINISTRATOR permissions
		if (member[0].hasPermission('ADMINISTRATOR') || (member[0].roles.highest.comparePositionTo(message.guild.me.roles.highest) > 0)) {
			return message.error(settings.Language, 'MODERATION/UNABLE_NICKNAME').then(m => m.delete({ timeout: 10000 }));
		}

		// Make sure a nickname was provided in the command
		if (args.length == 0) return message.error(settings.Language, 'MODERATION/ENTER_NICKNAME').then(m => m.delete({ timeout: 10000 }));

		// Get the nickanme
		const nickname = message.content.slice(6).replace(/<[^}]*>/, '').slice(1);

		// Make sure nickname is NOT longer than 32 characters
		if (nickname.length >= 32) return message.error(settings.Language, 'MODERATION/LONG_NICKNAME').then(m => m.delete({ timeout: 5000 }));

		// Change nickname and tell user (send error message if dosen't work)
		try {
			await member[0].setNickname(nickname);
			message.success(settings.Language, 'MODERATION/SUCCESSFULL_NICK', member[0].user).then(m => m.delete({ timeout: 5000 }));
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
