// Dependencies
const	Command = require('../../structures/Command.js');

module.exports = class G_delete extends Command {
	constructor(bot) {
		super(bot, {
			name: 'g-delete',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['giveaway-delete', 'gdelete'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Delete a giveaway',
			usage: 'g-delete <messageID>',
			cooldown: 2000,
			examples: ['g-delete 818821436255895612'],
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Make sure the user has the right permissions to use giveaway
		if (!message.member.hasPermission('MANAGE_GUILD')) return message.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => m.delete({ timeout: 10000 }));

		// Make sure the message ID of the giveaway embed is entered
		if (!args[0]) {
			if (message.deletable) message.delete();
			return message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));
		}

		// Delete the giveaway
		const messageID = args[0];
		bot.giveawaysManager.delete(messageID).then(() => {
			message.sendT(settings.Language, 'GIVEAWAY/SUCCESS_GIVEAWAY', 'deleted');
		}).catch((err) => {
			bot.logger.error(err);
			message.sendT(settings.Language, 'GIVEAWAY/UNKNOWN_GIVEAWAY', messageID);
		});
	}
};
