// Dependencies
const { Embed } = require('../../utils'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

module.exports = class Blurpify extends Command {
	constructor(bot) {
		super(bot, {
			name: 'blurpify',
			dirname: __dirname,
			aliases: ['blurp'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Blurpify an image.',
			usage: 'blurpify [file]',
			cooldown: 5000,
			examples: ['blurpify <attachment>', 'blurpify username'],
		});
	}

	// Run command
	async run(bot, message) {
		// Get image, defaults to author's avatar
		const files = await message.getImage();

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:GENERATING_IMAGE', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '' }));

		// Try and convert image
		try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=blurpify&image=${files[0]}`)).then(res => res.json());

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
