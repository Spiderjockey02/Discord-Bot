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
			usage: 'g-edit <messageID> <AddedTime> <newWinnerCount> <NewPrize>',
			cooldown: 2000,
			examples: ['g-edit 818821436255895612 2m 2 nitro', 'g-edit 818821436255895612 3h40m 5 nitro classic'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Make sure the user has the right permissions to use giveaway
		if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.error(settings.Language, 'USER_PERMISSION', 'MANAGE_GUILD').then(m => m.delete({ timeout: 10000 }));

		// Make sure the message ID of the giveaway embed is entered
		if (message.args.length != 4) {
			if (message.deletable) message.delete();
			return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));
		}


		// Get new Time
		const time = bot.timeFormatter.getTotalTime(message.args[0], message, settings.Language);
		if (!time) return;

		// Get new winner count
		if (isNaN(message.args[2])) {
			if (message.deletable) message.delete();
			return message.channel.error(settings.Language, 'GIVEAWAY/INCORRECT_WINNER_COUNT').then(m => m.delete({ timeout: 5000 }));
		}

		// Update giveaway
		bot.giveawaysManager.edit(message.args[0], {
			newWinnerCount: message.args[2],
			newPrize: message.args.slice(3).join(' '),
			addTime: time,
		}).then(() => {
			message.channel.send(bot.translate(settings.Language, 'GIVEAWAY/EDIT_GIVEAWAY', `${bot.giveawaysManager.options.updateCountdownEvery / 1000}`));
		}).catch((err) => {
			bot.logger.error(`Command: 'g-edit' has error: ${err.message}.`);
			message.channel.send(bot.translate(settings.Language, 'GIVEAWAY/UNKNOWN_GIVEAWAY', message.args[0]));
		});
	}
};
