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
				const hrStart = process.hrtime();
				const evaluated = inspect(await eval(toEval, { depth: 0 }));
				const hrDiff = process.hrtime(hrStart);
				return await message.channel.send(bot.translate(settings.Language, 'HOST/EVAL_RESPONSE', [hrDiff, evaluated]), { maxLength: 1900 });
			} else {
				return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => setTimeout(() => { m.delete(); }, 5000));
			}
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => setTimeout(() => { m.delete(); }, 5000));
		}
	}
};
