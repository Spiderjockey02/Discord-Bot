// Dependencies
const { image_search } = require('duckduckgo-images-api'),
	{ Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Image extends Command {
	constructor(bot) {
		super(bot, {
			name: 'image',
			dirname: __dirname,
			aliases: ['img'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Finds an image based on the topic.',
			usage: 'image <topic>',
			cooldown: 2000,
			examples: ['image food'],
		});
	}

	// Run command
	async run(bot, message, settings) {
		// Make sure a topic was included
		if (!message.args[0]) {
			if (message.deletable) message.delete();
			return message.channel.error('misc:INCORRECT_FORMAT', { EXAMPLE: settings.prefix.concat(message.translate('image/image:USAGE')) }).then(m => m.delete({ timeout: 5000 }));
		}

		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:GENERATING_IMAGE', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '' }));

		// get results (image links etc)
		try {
			const results = await image_search({ query: message.args.join(' '), moderate: (message.channel.nsfw || message.channel.type == 'dm') ? false : true, iterations: 2, retries: 2 });

			// send image
			const embed = new Embed(bot, message.guild)
				.setImage(results[Math.floor(Math.random() * results.length)].image);
			message.channel.send(embed);
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}
		msg.delete();
	}
};
