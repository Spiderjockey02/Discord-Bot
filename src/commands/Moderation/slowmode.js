// Dependencies
const { time: { getTotalTime } } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class SlowMode extends Command {
	constructor(bot) {
		super(bot, {
			name: 'slowmode',
			dirname: __dirname,
			aliases: ['slow-mode'],
			userPermissions: ['MANAGE_CHANNELS'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_CHANNELS'],
			description: 'Activate slowmode on a channel.',
			usage: 'slowmode <time / off>',
			cooldown: 5000,
			examples: ['slowmode off', 'slowmode 1m'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// get time
		let time;
		if (message.args[0] == 'off') {
			time = 0;
		} else if (message.args[0]) {
			time = getTotalTime(message.args[0], message);
			if (!time) return;
		} else {
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('moderation/slowmode:USAGE')) }).then(m => m.delete({ timeout: 5000 }));
		}

		// Activate slowmode
		try {
			await message.channel.setRateLimitPerUser(time / 1000);
			message.channel.success('moderation/slowmode:SUCCESS', { TIME: time == 0 ? message.translate('misc:OFF') : time / 1000 }).then(m => m.delete({ timeout:15000 }));
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
