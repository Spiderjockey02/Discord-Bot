// Dependencies
const	Command = require('../../structures/Command.js');

module.exports = class SlowMode extends Command {
	constructor(bot) {
		super(bot, {
			name: 'slowmode',
			dirname: __dirname,
			aliases: ['slow-mode'],
			userPermissions: ['MANAGE_CHANNELS'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_CHANNELS'],
			description: 'Activate slowmode on a channel.',
			usage: 'slowmode <time | off>',
			cooldown: 5000,
			examples: ['slowmode off', 'slowmode 1m'],
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Delete message
		if (settings.ModerationClearToggle & message.deletable) message.delete();

		// Make sure user can activate slowmode
		if (!message.member.hasPermission('MANAGE_CHANNELS')) return message.error(settings.Language, 'USER_PERMISSION', 'MANAGE_CHANNELS').then(m => m.delete({ timeout: 10000 }));

		// Check if bot can activate slowmode
		if (!message.channel.permissionsFor(bot.user).has('MANAGE_CHANNELS')) {
			bot.logger.error(`Missing permission: \`MANAGE_CHANNELS\` in [${message.guild.id}].`);
			return message.error(settings.Language, 'MISSING_PERMISSION', 'MANAGE_CHANNELS').then(m => m.delete({ timeout: 10000 }));
		}

		// get time
		let time;
		if (args[0] == 'off') {
			time = 0;
		} else if (args[0]) {
			time = require('../../helpers/time-converter.js').getTotalTime(args[0], message, settings.Language);
			if (!time) return;
		} else {
			return message.error(settings.Language, 'NOT_NUMBER').then(m => m.delete({ timeout: 10000 }));
		}

		// Activate slowmode
		try {
			await message.channel.setRateLimitPerUser(time / 1000);
			message.success(settings.Language, 'MODERATION/SUCCESSFULL_SLOWMODE', args[0]).then(m => m.delete({ timeout:15000 }));
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
