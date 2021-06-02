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
			examples: ['nick username Not a nice name'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Get user for nickname change
		const members = await message.getMember();

		// Check if they are changing their own name or not (and check permission)
		if (members[0] !== message.member && !message.member.hasPermission('MANAGE_NICKNAMES')) {
			return message.channel.error('misc:USER_PERMISSION', { PERMISSIONS: message.translate('permissions:MANAGE_NICKNAMES') }).then(m => m.delete({ timeout: 10000 }));
		}

		// Make sure user user does not have ADMINISTRATOR permissions
		if (members[0].hasPermission('ADMINISTRATOR') || (members[0].roles.highest.comparePositionTo(message.guild.me.roles.highest) > 0)) {
			return message.channel.error('moderation/nick:TOO_POWERFUL').then(m => m.delete({ timeout: 10000 }));
		}

		// Make sure a nickname was provided in the command
		if (message.args.length == 0) return message.channel.error('moderation/nick:ENTER_NICKNAME').then(m => m.delete({ timeout: 10000 }));

		// Get the nickanme
		const nickname = message.content.slice(6).replace(/<[^}]*>/, '').slice(1);

		// Make sure nickname is NOT longer than 32 characters
		if (nickname.length >= 32) return message.channel.error('moderation/nick:LONG_NICKNAME').then(m => m.delete({ timeout: 5000 }));

		// Change nickname and tell user (send error message if dosen't work)
		try {
			await members[0].setNickname(nickname);
			message.channel.success('moderation/nick:SUCCESS', { USER: members[0].user }).then(m => m.delete({ timeout: 5000 }));
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
