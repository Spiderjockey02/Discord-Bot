// Dependencies
const { get } = require('axios'),
	{ Embed } = require('../../utils'),
	Command = require('../../structures/Command.js');

module.exports = class Pussy extends Command {
	constructor(bot) {
		super(bot, {
			name: 'pussy',
			nsfw: true,
			dirname: __dirname,
			botPermissions: [ 'SEND_MESSAGES', 'EMBED_LINKS'],
			description: 'Look at NSFW images.',
			usage: 'pussy',
			cooldown: 2000,
			slash: true,
		});
	}

	// Function for message command
	async run(bot, message) {
		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('nsfw/4k:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		try {
			get('https://nekobot.xyz/api/image?type=pussy')
				.then(res => {
					msg.delete();
					const embed = new Embed(bot, message.guild)
						.setImage(res.data.message);
					message.channel.send({ embeds: [embed] });
				});
		} catch (err) {
			if (message.deletable) message.delete();
			msg.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}

	// Function for slash command
	async callback(bot, interaction, guild) {
		const channel = guild.channels.cache.get(interaction.channelID);
		try {
			get('https://nekobot.xyz/api/image?type=pussy')
				.then(res => {
					const embed = new Embed(bot, guild)
						.setImage(res.data.message);
					bot.send(interaction, { embeds: [embed] });
				});
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return bot.send(interaction, { embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
};
