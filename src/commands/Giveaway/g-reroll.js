// Dependencies
const	Command = require('../../structures/Command.js');

module.exports = class G_reroll extends Command {
	constructor(bot) {
		super(bot, {
			name: 'g-reroll',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['giveaway-reroll', 'greroll'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'reroll a giveaway.',
			usage: 'g-reroll <messageID>',
			cooldown: 2000,
			examples: ['g-reroll 818821436255895612'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Make sure the user has the right permissions to use giveaway
		if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => m.delete({ timeout: 10000 }));

		// Make sure the message ID of the giveaway embed is entered
		if (!message.args[0]) {
			if (message.deletable) message.delete();
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('giveaway/g-reroll:USAGE')) }).then(m => m.delete({ timeout: 5000 }));
		}

		// re-roll the giveaway
		const messageID = message.args[0];
		bot.giveawaysManager.reroll(messageID, {
			congrat: message.translate('giveaway/g-reroll:CONGRAT'),
			error: message.translate('giveaway/g-reroll:ERROR'),
		}).then(() => {
			message.channel.send(bot.translate('giveaway/g-reroll:SUCCESS_GIVEAWAY'));
		}).catch((err) => {
			bot.logger.error(`Command: 'g-reroll' has error: ${err.message}.`);
			message.channel.send(bot.translate('giveaway/g-reroll:UNKNOWN_GIVEAWAY', { MESSAGEID: messageID }));
		});
	}
};
