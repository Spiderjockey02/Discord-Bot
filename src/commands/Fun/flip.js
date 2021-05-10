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
		const r = Math.round(Math.random());
		message.channel.send(`${message.checkEmoji() ? bot.customEmojis[['head', 'tail'][r]] : ''} ${bot.translate(settings.Language, 'FUN/FLIP_CHOICE', r)}`);
	}
};
