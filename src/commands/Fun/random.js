// Dependencies
const Command = require('../../structures/Command.js');

module.exports = class Random extends Command {
	constructor(bot) {
		super(bot, {
			name: 'random',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Replies with a random number.',
			usage: 'random <LowNum> <HighNum>',
			cooldown: 1000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Random number and facts command
		const max = 100000,
			num1 = parseInt(args[0]),
			num2 = parseInt(args[1]);
		// Make sure both entries are there
		if (!num1 || !args[1]) {
			if (message.deletable) message.delete();
			message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));
			return;
		} else {
			// Make sure both entries are numbers
			if (isNaN(num1) || isNaN(num2)) {
				if (message.deletable) message.delete();
				message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));
				return;
			}

			// Make sure they follow correct rules
			if ((num2 < num1) || (num1 === num2) || (num2 > max) || (num1 < 0)) {
				if (message.deletable) message.delete();
				message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));
				return;
			}
			const r = Math.floor(Math.random() * (num2 - num1) + num1) + 1;
			message.sendT(settings.Language, 'FUN/RANDOM_RESPONSE', r);
		}
	}
};
