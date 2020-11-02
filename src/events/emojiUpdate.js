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
	// Check if moderation plugin is on
	if (settings.ModLog == false) return;
	// Check if moderation channel is valid
	if (settings.ModLogEvents.includes('EMOJIUPDATE')) {
		const embed = new MessageEmbed()
			.setColor(15105570)
			.setAuthor('~Emoji updated~')
			.addField('Emoji name', newEmoji.name, true)
			.addField('Emoji ID', newEmoji.id, true)
			.addField('Emoji animated', newEmoji.animated, true)
			.addField('Emoji preview', `<:${newEmoji.name}:${newEmoji.id}>`)
			.setTimestamp();
		// send message
		const modChannel = newEmoji.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel);
		if (modChannel) modChannel.send(embed);
		// log event in console
		bot.logger.log(`Emoji: ${newEmoji.name} has been updated in Server: ${newEmoji.guild.id}`);
	}
};
