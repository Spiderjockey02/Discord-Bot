// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports = async (bot, emoji) => {
	// Get server settings
	const settings = emoji.guild.settings;

	// Check if event emojiCreate is for logging
	if (settings.ModLogEvents.includes('EMOJICREATE') && settings.ModLog) {
		const embed = new MessageEmbed()
			.setDescription(`**Emoji: ${emoji} (${emoji.name}) was created**`)
			.setColor(3066993)
			.setFooter(`ID: ${emoji.id}`)
			.setAuthor(emoji.guild.name, emoji.guild.iconURL())
			.setTimestamp();

		// Find channel and send message
		const modChannel = emoji.guild.channels.cache.get(settings.ModLogChannel);
		if (modChannel) modChannel.send(embed);
	}
};
