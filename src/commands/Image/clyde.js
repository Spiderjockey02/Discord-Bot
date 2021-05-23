// Dependencies
const { Embed } = require('../../utils'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

module.exports = class Clyde extends Command {
	constructor(bot) {
		super(bot, {
			name: 'clyde',
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Create a fake Clyde message.',
			usage: 'clyde <text>',
			cooldown: 5000,
			examples: ['clyde Hello I\'m a bot'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Get text
		const text = message.args.join(' ');

		// make sure text was entered
		if (!text) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('image/clyde:USAGE')) }).then(m => m.delete({ timeout: 5000 }));

		// make sure the text isn't longer than 70 characters
		if (text.length >= 71) return message.channel.error('image/clyde:TOO_LONG').then(m => m.delete({ timeout: 5000 }));

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:GENERATING_IMAGE', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '' }));

		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=clyde&text=${text}`)).then(res => res.json());

			// send image
			const embed = new Embed(bot, message.guild)
				.setColor(3447003)
				.setImage(json.message);
			message.channel.send(embed);
		} catch(err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}
		msg.delete();
	}
};
