// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports = async (bot, oldEmoji, newEmoji) => {
	// Get server settings
	let settings;
	try {
		settings = await bot.getGuild(newEmoji.guild);
	} catch (e) {
		console.log(e);
	}

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
		if (modChannel) modChannel.send(embed);
	}
};
