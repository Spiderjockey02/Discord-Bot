// Dependencies
const	Command = require('../../structures/Command.js');

module.exports = class G_edit extends Command {
	constructor(bot) {
		super(bot, {
			name: 'g-edit',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['giveaway-edit', 'gedit'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Edit a giveaway.',
			usage: 'g-edit <messageID> <AddedTime> <NewPrize> <newWinnerCount>',
			cooldown: 2000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Make sure the user has the right permissions to use giveaway
		if (!message.member.hasPermission('MANAGE_GUILD')) return message.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => m.delete({ timeout: 10000 }));

		// Make sure the message ID of the giveaway embed is entered
		if (args.length != 4) {
			if (message.deletable) message.delete();
			return message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));
		}


		// Get new Time
		const time = require('../../helpers/time-converter.js').getTotalTime(args[1], message, settings.Language);
		if (!time) return;

		// Get new winner count
		if (isNaN(args[3])) {
			if (message.deletable) message.delete();
			return message.error(settings.Language, 'GIVEAWAY/INCORRECT_WINNER_COUNT').then(m => m.delete({ timeout: 5000 }));
		}

		// Update giveaway
		bot.giveawaysManager.edit(args[0], {
			newWinnerCount: args[3],
			newPrize: args[2],
			addTime: time,
		}).then(() => {
			message.sendT(settings.Language, 'GIVEAWAY/EDIT_GIVEAWAY', `${bot.giveawaysManager.options.updateCountdownEvery / 1000}`);
		}).catch((err) => {
			bot.logger.error(err);
			message.sendT(settings.Language, 'GIVEAWAY/UNKNOWN_GIVEAWAY', args[0]);
		});
	}
};
