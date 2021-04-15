// Dependencies
const Command = require('../../structures/Command.js');

module.exports = class Flip extends Command {
	constructor(bot) {
		super(bot, {
			name: 'flip',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Flip a coin.',
			usage: 'flip',
			cooldown: 1000,
		});
	}

	// Run command
	async run(bot, message, settings) {
		message.channel.send(bot.translate(settings.Language, 'FUN/FLIP_CHOICE', Math.round(Math.random())));
	}
};
