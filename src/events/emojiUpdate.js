// Dependencies
const { MessageEmbed } = require('discord.js'),
	Event = require('../structures/Event');

module.exports = class emojiUpdate extends Event {
	async run(bot, oldEmoji, newEmoji) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Emoji: ${newEmoji.name} has been updated in guild: ${newEmoji.guild.id}.`);

		// Get server settings / if no settings then return
		const settings = newEmoji.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event emojiUpdate is for logging
		if (settings.ModLogEvents.includes('EMOJIUPDATE') && settings.ModLog) {
			const embed = new MessageEmbed()
				.setDescription(`**Emoji name change ${newEmoji}**`)
				.setColor(15105570)
				.setFooter(`ID: ${newEmoji.id}`)
				.setAuthor(newEmoji.guild.name, newEmoji.guild.iconURL())
				.addFields(
					{ name: 'Old:', value: `${oldEmoji.name}`, inline: true },
					{ name: 'New:', value: `${newEmoji.name}`, inline: true },
				)
				.setTimestamp();

			// Find channel and send message
			const modChannel = await bot.channels.fetch(settings.ModLogChannel);
			if (modChannel && modChannel.guild.id == newEmoji.guild.id) bot.addEmbed(modChannel.id, embed);
		}
	}
};
