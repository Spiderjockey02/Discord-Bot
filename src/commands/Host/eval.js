// Dependencies
const { inspect } = require('util');

module.exports.run = async (bot, message, args, settings) => {
	// Make sure only bot owner can do this command
	if (!bot.config.ownerID.includes(message.author.id)) return message.sendT(settings.Language, 'HOST/EVAL_NO_OWNER');

	// Evaluated the code
	const toEval = args.join(' ');
	try {
		if (toEval) {
			// Auto-complete commands
			const hrStart = process.hrtime();
			const evaluated = inspect(eval(toEval, { depth: 0 }));
			const hrDiff = process.hrtime(hrStart);
			return await message.channel.send(message.translate(settings.Language, 'HOST/EVAL_RESPONSE', [hrDiff, evaluated]), { maxLength: 1900 });
		} else {
			return message.error(settings.Language, 'INCORRECT_FORMAT', bot.commands.get('eval').help.usage.replace('${PREFIX}', settings.prefix)).then(m => m.delete({ timeout: 5000 }));
		}
	} catch(err) {
		if (bot.config.debug) bot.logger.error(`${err.message} - command: eval.`);
		message.sendT(settings.Language, 'HOST/EVAL_ERROR', err.message);
	}
};

module.exports.config = {
	command: 'eval',
};

module.exports.help = {
	name: 'eval',
	category: 'Host',
	description: 'Evaluates code.',
	usage: '${PREFIX}eval <code>',
};
