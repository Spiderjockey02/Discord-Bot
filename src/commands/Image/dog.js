// Dependencies
const { Embed } = require('../../utils'),
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
			slash: true,
		});
	}

	// Run command
	async run(bot, message) {
		// send 'waiting' message to show bot has recieved message
		const msg = await message.channel.send(message.translate('misc:FETCHING', {
			EMOJI: message.checkEmoji() ? bot.customEmojis['loading'] : '', ITEM: this.help.name }));

		const res = await fetch('https://nekos.life/api/v2/img/woof')
			.then(info => info.json())
			.catch(err => {
				// An error occured when looking for image
				if (message.deletable) message.delete();
				bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
				msg.delete();
				return message.channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }).then(m => m.timedDelete({ timeout: 5000 }));
			});

		msg.delete();
		// send image
		const embed = new Embed(bot, message.guild)
			.setImage(res.url);
		message.channel.send({ embeds: [embed] });
	}

	// Function for slash command
	async callback(bot, interaction, guild) {
		const channel = guild.channels.cache.get(interaction.channelId);
		await interaction.reply({ content: guild.translate('misc:GENERATING_IMAGE', {
			EMOJI: bot.customEmojis['loading'] }) });
		try {
			const res = await fetch('https://nekos.life/api/v2/img/woof').then(info => info.json());
			// send image
			const embed = new Embed(bot, guild)
				.setColor(3426654)
				.setImage(res.url);
			interaction.editReply({ content: ' ', embeds: [embed] });
		} catch(err) {
			bot.logger.error(`Command: '${this.help.name}' has error: ${err.message}.`);
			return interaction.editReply({ embeds: [channel.error('misc:ERROR_MESSAGE', { ERROR: err.message }, true)], ephemeral: true });
		}
	}
};
