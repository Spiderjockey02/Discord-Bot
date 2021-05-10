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
			examples: ['shorturl https://www.google.com', 'shorturl https://www.youtube.com'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		const mes = message.content.split(' ').slice(1).join(' ');

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(`${message.checkEmoji() ? bot.customEmojis['loading'] : ''} Fetching ${this.help.name}...`);

		try {
			shorten(mes, function(res) {
				msg.delete();
				message.channel.send(res);
			});
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			msg.delete();
			message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
