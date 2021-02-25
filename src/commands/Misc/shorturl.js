// Dependencies
const { shorten } = require('tinyurl'),
	Command = require('../../structures/Command.js');

module.exports = class ShortURL extends Command {
	constructor(bot) {
		super(bot, {
			name: 'shorturl',
			dirname: __dirname,
			aliases: ['surl', 'short-url'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Creates a shorturl on the URL you sent.',
			usage: 'shorturl',
			cooldown: 3000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		const mes = message.content.split(' ').slice(1).join(' ');
		try {
			shorten(mes, function(res) {
				message.channel.send(res);
			});
		} catch (err) {
			if (bot.config.debug) bot.logger.error(`${err.message} - command: shorturl.`);
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 })).then(m => m.delete({ timeout: 10000 }));
		}
	}
};
