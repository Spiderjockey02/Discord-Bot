// Dependencies
const { Embed } = require('../../utils'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

module.exports = class ChangeMyMind extends Command {
	constructor(bot) {
		super(bot, {
			name: 'changemymind',
			dirname: __dirname,
			aliases: ['cmm'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Create a change my mind image.',
			usage: 'changemymind <text>',
			cooldown: 5000,
			examples: ['changemymind Egglord is the greatest'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Get text
		const text = message.args.join(' ');

		// make sure text was entered
		if (!text) return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('image/changemymind:USAGE')) }).then(m => m.delete({ timeout: 5000 }));

		// make sure the text isn't longer than 80 characters
		if (text.length >= 81) return message.channel.error('image/changemymind:TOO_LONG').then(m => m.delete({ timeout: 5000 }));

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:GENERATING_IMAGE', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '' }));

		// Try and convert image
		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=changemymind&text=${text}`)).then(res => res.json());

			// send image
			const embed = new Embed(bot, message.guild)
				.setColor(2067276)
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
