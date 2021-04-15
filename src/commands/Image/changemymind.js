// Dependencies
const { MessageEmbed } = require('discord.js'),
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
		if (!text) return message.channel.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));

		// make sure the text isn't longer than 80 characters
		if (text.length >= 81) return message.channel.error(settings.Language, 'IMAGE/TEXT_OVERLOAD', 80).then(m => m.delete({ timeout: 5000 }));

		// send 'waiting' message
		const msg = await message.channel.send(bot.translate(settings.Language, 'IMAGE/GENERATING_IMAGE'));

		// Try and convert image
		try {
			const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=changemymind&text=${text}`));
			const json = await res.json();
			// send image
			const embed = new MessageEmbed()
				.setColor(2067276)
				.setImage(json.message);
			msg.delete();
			message.channel.send(embed);
		} catch(err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
