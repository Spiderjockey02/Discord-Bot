// Dependencies
const { time: { getTotalTime } } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class G_start extends Command {
	constructor(bot) {
		super(bot, {
			name: 'g-start',
			guildOnly: true,
			dirname: __dirname,
			aliases: ['gstart', 'g-create'],
			userPermissions: ['MANAGE_GUILD'],
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
			description: 'Start a giveaway',
			usage: 'g-start <time> <Number of winners> <prize>',
			cooldown: 30000,
			examples: ['g-start 1m 1 nitro', 'g-start 2h30m 3 nitro classic'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Make sure a time, winner count & prize is entered
		if (message.args.length <= 2) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('giveaway/g-start:USAGE')) }).then(m => m.delete({ timeout: 5000 }));

		// Get time
		const time = getTotalTime(message.args[0], message);
		if (!time) return;

		// Make sure that number of winners is a number
		if (isNaN(message.args[1]) || message.args[1] > 10) return message.channel.error('giveaway/g-edit:INCORRECT_WINNER_COUNT').then(m => m.delete({ timeout: 5000 }));

		// Make sure prize is less than 256 characters
		if (message.args.slice(2).join(' ').length >= 256) return message.channel.error('giveaway/g-start:PRIZE_TOO_LONG').then(m => m.delete({ timeout: 5000 }));

		// Start the giveaway
		bot.giveawaysManager.start(message.channel, {
			time: time,
			prize: message.args.slice(2).join(' '),
			winnerCount: parseInt(message.args[1]),
			hostedBy: message.member,
			messages: {
				giveaway: message.translate('giveaway/g-start:TITLE'),
				giveawayEnded: message.translate('giveaway/g-start:ENDED'),
				timeRemaining: message.translate('giveaway/g-start:TIME_REMAINING'),
				inviteToParticipate: message.translate('giveaway/g-start:INVITE_PARTICIPATE'),
				winMessage: message.translate('giveaway/g-start:WIN_MESSAGE'),
				embedFooter: message.translate('giveaway/g-start:FOOTER'),
				noWinner: message.translate('giveaway/g-start:NO_WINNER'),
				winners: message.translate('giveaway/g-start:WINNERS'),
				endedAt: message.translate('giveaway/g-start:END_AT'),
				hostedBy: message.translate('giveaway/g-start:HOSTED'),
				units: {
					seconds: message.translate('time:SECONDS', { amount: '' }).trim(),
					minutes: message.translate('time:MINUTES', { amount: '' }).trim(),
					hours: message.translate('time:HOURS', { amount: '' }).trim(),
					days: message.translate('time:DAYS', { amount: '' }).trim(),
				},
			},
			// language settings
		}).then(() => {
			bot.logger.log(`${message.author.tag} started a giveaway in server: [${message.guild.id}].`);
		}).catch(err => {
			bot.logger.error(`Command: 'g-start' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		});
	}
};
