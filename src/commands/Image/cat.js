// Dependencies
const { Embed } = require('../../utils'),
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
	async run(bot, message) {
		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		const res = await fetch('https://nekos.life/api/v2/img/meow')
			.then(info => info.json())
			.catch(err => {
				// An error occured when looking for image
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				msg.delete();
				return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
			});

		msg.delete();
		// send image
		const embed = new Embed(bot, message.guild)
			.setColor(3426654)
			.setImage(res.url);
		message.channel.send(embed);
	}
};
