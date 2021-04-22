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
			return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));
		}

		// re-roll the giveaway
		const messageID = message.args[0];
		bot.giveawaysManager.reroll(messageID).then(() => {
			message.channel.send(bot.translate(settings.Language, 'GIVEAWAY/SUCCESS_GIVEAWAY', 'rerolled'));
		}).catch((err) => {
			bot.logger.error(`Command: 'g-reroll' has error: ${err.message}.`);
			message.channel.send(bot.translate(settings.Language, 'GIVEAWAY/UNKNOWN_GIVEAWAY', messageID));
		});
	}
};
