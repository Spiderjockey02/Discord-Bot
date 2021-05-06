// Dependencies
const { image_search } = require('duckduckgo-images-api'),
	{ MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Image extends Command {
	constructor(bot) {
		super(bot, {
			name: 'img',
			dirname: __dirname,
			aliases: ['image'],
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
			return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));
		}

		// send 'waiting' message
		const msg = await message.channel.send(`${bot.customEmojis['loading']} Fetching image...`);

		// get results (image links etc)
		try {
			const results = await image_search({ query: message.args.join(' '), moderate: (message.channel.nsfw || message.channel.type == 'dm') ? false : true, iterations: 2, retries: 2 });

			// send image
			msg.delete();
			const embed = new MessageEmbed()
				.setImage(results[Math.floor(Math.random() * results.length)].image);
			message.channel.send(embed);
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
