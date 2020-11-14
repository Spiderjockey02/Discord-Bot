// Dependencies
const ms = require('ms');

module.exports.run = async (bot, message, args, settings) => {
	// Delete message
	if (settings.ModerationClearToggle & message.deletable) message.delete();

	// Make sure user can activate slowmode
	if (!message.member.hasPermission('MANAGE_CHANNELS')) return message.error(settings.Language, 'USER_PERMISSION', 'MANAGE_CHANNELS').then(m => m.delete({ timeout: 10000 }));

	// Check if bot can activate sowmode
	if (!message.guild.me.hasPermission('MANAGE_CHANNELS')) {
		bot.logger.error(`Missing permission: \`MANAGE_CHANNELS\` in [${message.guild.id}].`);
		return message.error(settings.Language, 'MISSING_PERMISSION', 'MANAGE_CHANNELS').then(m => m.delete({ timeout: 10000 }));
	}

	// get time
	let time;
	if (args[0] == 'off') {
		time = 0;
	} else {
		time = ms(args[0]) / 1000;
		// Get slowmode time
		if (!time) return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('slowmode').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));

		if(isNaN(time)) return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('slowmode').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));

		if(time > 21600) return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('slowmode').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));

	}

	// Activate slowmode
	try {
		await message.channel.setRateLimitPerUser(time);
		message.success(settings.Language, 'MODERATION/SUCCESSFULL_SLOWMODE', args[0]).then(m => m.delete({ timeout:15000 }));
	} catch (err) {
		message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		if (bot.config.debug) bot.logger.error(`${err.message} - command: slowmode.`);
	}
};

module.exports.config = {
	command: 'slowmode',
	aliases: ['slow-mode'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Slowmode',
	category: 'Moderation',
	description: 'Activate slowmode on a channel.',
	usage: '${PREFIX}slowmode <time>',
	example: '${PREFIX}slowmode 1h',
};
