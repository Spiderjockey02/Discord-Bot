// Dependencies
const fetch = require('node-fetch'),
	{ MessageEmbed } = require('discord.js'),
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
			slash: true,
		});
	}

	// Function for message command
	async run(bot, message) {
		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		// Connect to API and fetch data
		try {
			const data = await fetch('https://api.adviceslip.com/advice').then(res => res.json());
			msg.delete();
			const embed = new MessageEmbed()
				.setDescription(`💡 ${data.slip.advice}`);
			message.channel.send({ embeds: [embed] });
		} catch (err) {
			if (message.deletable) message.delete();
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			msg.delete();
			message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
		}
	}

	// Function for slash command
	async callback(bot, interaction, guild) {
		const channel = guild.channels.cache.get(interaction.channelID);
		try {
			const data = await fetch('https://api.adviceslip.com/advice').then(res => res.json());
			await bot.send(interaction, { embeds: [{ color: 'RANDOM', description: `💡 ${data.slip.advice}` }] });
		} catch (err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return bot.send(interaction, { embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
};
