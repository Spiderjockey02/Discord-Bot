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
			examples: ['random 1 10', 'random 5 99'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Random number and facts command
		const max = 100000,
			num1 = parseInt(message.args[0]),
			num2 = parseInt(message.args[1]);

		// Make sure both entries are there
		if (!num1 || !message.args[1]) {
			if (message.deletable) message.delete();
			return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => setTimeout(() => { m.delete(); }, 5000));
		} else {
			// Make sure both entries are numbers
			if (isNaN(num1) || isNaN(num2)) {
				if (message.deletable) message.delete();
				return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => setTimeout(() => { m.delete(); }, 5000));
			}

			// Make sure they follow correct rules
			if ((num2 < num1) || (num1 === num2) || (num2 > max) || (num1 < 0)) {
				if (message.deletable) message.delete();
				return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => setTimeout(() => { m.delete(); }, 5000));
			}

			// send result
			const r = Math.floor(Math.random() * (num2 - num1) + num1) + 1;
			message.channel.send({ embed: { color: 'RANDOM', description: `🎲 ${bot.translate(settings.Language, 'FUN/RANDOM_RESPONSE', r)}` } });
		}
	}
};
