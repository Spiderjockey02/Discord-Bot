// Dependencies
const { MessageEmbed } = require('discord.js'),
	fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

module.exports = class Dog extends Command {
	constructor(bot) {
		super(bot, {
			name: 'dog',
			dirname: __dirname,
			aliases: ['woof'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Have a nice picture of a dog.',
			usage: 'dog',
			cooldown: 2000,
		});
	}

	// Run command
	async run(bot, message, args, settings) {
		const res = await fetch('https://nekos.life/api/v2/img/woof')
			.then(info => info.json())
			.catch(err => {
				// An error occured when looking for image
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				return message.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
			});

		// send image
		const embed = new MessageEmbed()
			.setImage(res.url);
		message.channel.send(embed);
	}
};
