// Dependencies
const { MessageEmbed } = require('discord.js'),
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
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		// Get text
		const text = args.join(' ');

		// make sure text was entered
		if (!text) return message.error(settings.Language, 'INCORRECT_FORMAT', settings.prefix.concat(this.help.usage)).then(m => m.delete({ timeout: 5000 }));

		// make sure the text isn't longer than 70 characters
		if (text.length >= 71) return message.error(settings.Language, 'IMAGE/TEXT_OVERLOAD', 70).then(m => m.delete({ timeout: 5000 }));

		// send 'waiting' message
		const msg = await message.sendT(settings.Language, 'IMAGE/GENERATING_IMAGE');
		try {
			const res = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=clyde&text=${text}`));
			const json = await res.json();
			// send image
			const embed = new MessageEmbed()
				.setColor(3447003)
				.setImage(json.message);
			msg.delete();
			message.channel.send(embed);
		} catch(err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
		}
	}
};
