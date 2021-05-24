// Dependencies
const { Embed } = require('../../utils'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

module.exports = class Threats extends Command {
	constructor(bot) {
		super(bot, {
			name: 'threats',
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Creates a threat meme.',
			usage: 'threats [image]',
			cooldown: 5000,
			examples: ['threats username', 'threats <attachment>'],
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
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=threats&url=${files[0]}`)).then(res => res.json());

			// send image in embed
			const embed = new Embed(bot, message.guild)
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
