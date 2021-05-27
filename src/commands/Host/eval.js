// Dependencies
const { inspect } = require('util'),
	Command = require('../../structures/Command.js');

module.exports = class Eval extends Command {
	constructor(bot) {
		super(bot, {
			name: 'eval',
			ownerOnly: true,
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Evaluates JS code.',
			usage: 'eval <code>',
			cooldown: 3000,
			examples: ['eval bot.users.cache.get(\'184376969016639488\')'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Evaluated the code
		const toEval = message.args.join(' ');
		try {
			if (toEval) {
				// Auto-complete commands
				const hrStart = process.hrtime(),
					evaluated = inspect(await eval(toEval, { depth: 0 })),
					hrDiff = process.hrtime(hrStart);
				message.channel.send(bot.translate('host/eval:RESPONSE', { DIFF: `${hrDiff[0] > 0 ? `${hrDiff[0]}s` : ''}${hrDiff[1] / 1000000}`, CODE: evaluated }), { split: true });
			} else {
				message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('host/eval:USAGE')) }).then(m => m.delete({ timeout: 5000 }));
			}
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
