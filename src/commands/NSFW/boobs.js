// Dependecies
const { get } = require('axios'),
	{ Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Boobs extends Command {
	constructor(bot) {
		super(bot, {
			name: 'boobs',
			nsfw: true,
			dirname: __dirname,
			aliases: ['boob'],
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Look at NSFW images.',
			usage: 'boobs',
			cooldown: 2000,
		});
	}

	// Run command
	async run(bot, message) {
		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('nsfw/4k:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		try {
			get('https://nekobot.xyz/api/image?type=boobs')
				.then(res => {
					msg.delete();
					const embed = new Embed(bot, message.guild)
						.setImage(res.data.message);
					message.channel.send(embed);
				});
		} catch (err) {
			if (message.deletable) message.delete();
			msg.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
