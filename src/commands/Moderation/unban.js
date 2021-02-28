// Dependencies
const	Command = require('../../structures/Command.js');

module.exports = class Unban extends Command {
	constructor(bot) {
		super(bot, {
			name: 'unban',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['un-ban'],
			userPermissions: ['BAN_MEMBERS'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'BAN_MEMBERS'],
			description: 'Unban a user.',
			usage: 'unban <user> [reason]',
			cooldown: 5000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Make sure user can ban users
		if (!message.member.hasPermission('BAN_MEMBERS')) return message.error(settings.Language, 'USER_PERMISSION', 'BAN_MEMBERS').then(m => m.delete({ timeout: 10000 }));


		// Check if bot has permission to ban user
		if (!message.guild.me.hasPermission('BAN_MEMBERS')) {
			bot.logger.error(`Missing permission: \`BAN_MEMBERS\` in [${message.guild.id}].`);
			return message.error(settings.Language, 'MISSING_PERMISSION', 'BAN_MEMBERS').then(m => m.delete({ timeout: 10000 }));
		}

		// Unban user
		const user = args[0];
		try {
			message.guild.fetchBans().then(bans => {
				if (bans.size == 0) return;
				const bUser = bans.find(ban => ban.user.id == user);
				if (!bUser) return;
				message.guild.members.unban(bUser.user);
				message.success(settings.Language, 'MODERATION/SUCCESSFULL_UNBAN', bUser.user).then(m => m.delete({ timeout: 3000 }));
			});
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		}
	}
};
