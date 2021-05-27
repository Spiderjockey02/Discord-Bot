// Dependencies
const { time: { getTotalTime } } = require('../../utils'),
	Command = require('../../structures/Command.js');

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
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Make sure the message ID of the giveaway embed is entered
		if (message.args.length <= 3) {
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('giveaway/g-edit:USAGE')) }).then(m => m.delete({ timeout: 5000 }));
		}

		// Get new Time
		const time = getTotalTime(message.args[1], message);
		if (!time) return;

		// Get new winner count
		if (isNaN(message.args[2])) {
			return message.channel.error('giveaway/g-edit:INCORRECT_WINNER_COUNT').then(m => m.delete({ timeout: 5000 }));
		}

		// Update giveaway
		bot.giveawaysManager.edit(message.args[0], {
			newWinnerCount: parseInt(message.args[2]),
			newPrize: message.args.slice(3).join(' '),
			addTime: time,
		}).then(() => {
			message.channel.send(bot.translate('giveaway/g-edit:EDIT_GIVEAWAY', { TIME: bot.giveawaysManager.options.updateCountdownEvery / 1000 }));
		}).catch((err) => {
			bot.logger.error(`Command: 'g-edit' has error: ${err.message}.`);
			message.channel.send(bot.translate('giveaway/g-edit:UNKNOWN_GIVEAWAY', { ID: message.args[0] }));
		});
	}
};
