// Dependecies
const { get } = require('axios'),
	{ MessageEmbed } = require('discord.js'),
	Command = require('../../structures/Command.js');

module.exports = class Boobs extends Command {
	constructor(bot) {
		super(bot, {
			name: 'boobs',
			nsfw: true,
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Look at NSFW images.',
			usage: 'boobs',
			cooldown: 2000,
		});
	}

	// Run command
	async run(bot, message, settings) {
		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(`${bot.customEmojis['loading']} Fetching ${this.help.name} image...`);

		try {
			get('https://nekobot.xyz/api/image?type=boobs')
				.then(res => {
					msg.delete();
					const embed = new MessageEmbed()
						.setImage(res.data.message);
					message.channel.send(embed);
				});
		} catch (err) {
			if (message.deletable) message.delete();
			msg.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
