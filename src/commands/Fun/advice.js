// Dependencies
const fetch = require('node-fetch'),
	Command = require('../../structures/Command.js');

module.exports = class Advice extends Command {
	constructor(bot) {
		super(bot, {
			name: 'advice',
			dirname: __dirname,
			botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Get some random advice',
			usage: 'advice',
			cooldown: 1000,
		});
	}

	// Run command
	async run(bot, message, settings) {
		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(`${bot.customEmojis['loading']} Fetching ${this.help.name}...`);

		// Connect to API and fetch data
		try {
			const data = await fetch('https://api.adviceslip.com/advice').then(res => res.json());
			msg.delete();
			message.channel.send({ embed: { color: 'RANDOM', description: data.slip.advice } });
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			msg.delete();
			message.channel.error(settings.Language, 'ERROR_MESSAGE', err.message).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
