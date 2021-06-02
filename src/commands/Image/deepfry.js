// Dependencies
const { Embed } = require('../../utils'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

module.exports = class Deepfry extends Command {
	constructor(bot) {
		super(bot, {
			name: 'deepfry',
			dirname: __dirname,
			aliases: ['deep-fry'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Deepfry an image.',
			usage: 'deepfry [file]',
			cooldown: 5000,
			examples: ['deepfry <attachment>', 'deepfry username'],
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
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=deepfry&image=${files[0]}`)).then(res => res.json());
			// send image
			const embed = new Embed(bot, message.guild)
				.setColor(15105570)
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
