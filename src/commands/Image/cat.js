// Dependencies
const { MessageEmbed } = require('discord.js'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

module.exports = class Cat extends Command {
	constructor(bot) {
		super(bot, {
			name: 'cat',
			dirname: __dirname,
			aliases: ['meow'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Have a nice picture of a cat.',
			usage: 'cat',
			cooldown: 2000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		const res = await fetch('https://nekos.life/api/v2/img/meow').then(info => info.json()).catch(err => {
			// An error occured when looking for image
			if (bot.config.debug) bot.logger.error(`${err.message} - command: cat.`);
			message.error(settings.Language, 'ERROR_MESSAGE').then(m => m.delete({ timeout: 5000 }));
			message.delete();
			return;
		});

		// send image
		const embed = new MessageEmbed()
			.setColor(3426654)
			.setImage(res.url);
		message.channel.send(embed);
	}
};
