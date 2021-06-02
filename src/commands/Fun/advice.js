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
			slash: true
		});
	}

	// Run command
	async run(bot, message) {
		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// Connect to API and fetch data
		try {
			const data = await fetch('https://api.adviceslip.com/advice').then(res => res.json());
			msg.delete();
			message.channel.send({ embed: { color: 'RANDOM', description: `💡 ${data.slip.advice}` } });
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			msg.delete();
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}
	}
	async callback(bot, interaction, guild) {
		const channel = guild.channels.cache.get(interaction.channel_id)
		try {
			const data = await fetch('https://api.adviceslip.com/advice').then(res => res.json());
			return await bot.send(interaction, { embed: { color: 'RANDOM', description: `💡 ${data.slip.advice}` } })
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.delete({ timeout: 5000 }));
		}
	}
};
