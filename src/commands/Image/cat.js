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
	async run(bot, message, settings) {
		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(`${message.checkEmoji() ? bot.customEmojis['loading'] : ''} Fetching ${this.help.name}...`);

		const res = await fetch('https://nekos.life/api/v2/img/meow')
			.then(info => info.json())
			.catch(err => {
				// An error occured when looking for image
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				msg.delete();
				return message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => setTimeout(() => { m.delete(); }, 5000));
			});

		msg.delete();
		// send image
		const embed = new MessageEmbed()
			.setColor(3426654)
			.setImage(res.url);
		message.channel.send(embed);
	}
};
