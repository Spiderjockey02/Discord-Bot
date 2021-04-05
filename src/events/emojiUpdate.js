// Dependencies
const { MessageEmbed } = require('discord.js'),
	Event = require('../structures/Event');

module.exports = class emojiUpdate extends Event {
	async run(bot, oldEmoji, newEmoji) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Emoji: ${newEmoji.name} has been deleted in guild: ${newEmoji.guild.id}.`);

		// Get server settings / if no settings then return
		const settings = newEmoji.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event emojiUpdate is for logging
		if (settings.ModLogEvents.includes('EMOJIUPDATE') && settings.ModLog) {
			const embed = new MessageEmbed()
				.setColor(15105570)
				.setAuthor('~Emoji updated~')
				.addField('Emoji name', newEmoji.name, true)
				.addField('Emoji ID', newEmoji.id, true)
				.addField('Emoji animated', newEmoji.animated, true)
				.addField('Emoji preview', `<:${newEmoji.name}:${newEmoji.id}>`)
				.setTimestamp();

			// Find channel and send message
			const modChannel = newEmoji.guild.channels.cache.get(settings.ModLogChannel);
			if (modChannel) require('../helpers/webhook-manager')(bot, modChannel.id, embed);
		}
	}
};
