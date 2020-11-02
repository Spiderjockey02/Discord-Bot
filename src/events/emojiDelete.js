// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports = async (bot, emoji) => {
	// Get server settings
	let settings;
	try {
		settings = await bot.getGuild(emoji.guild);
	} catch (e) {
		console.log(e);
	}
	// Check if ModLog plugin is active
	if (settings.ModLog == false) return;
	// Check if event channelCreate is for logging
	if (settings.ModLogEvents.includes('EMOJIDELETE')) {
		const embed = new MessageEmbed()
			.setDescription(`**Emoji: ${emoji} (${emoji.name}) was deleted**`)
			.setColor(15158332)
			.setFooter(`ID: ${emoji.id}`)
			.setAuthor(emoji.guild.name, emoji.guild.iconURL())
			.setTimestamp();
		// send message
		const modChannel = emoji.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel);
		if (modChannel) modChannel.send(embed);
		// log event in console
		bot.logger.log(`Emoji: ${emoji.name} has been deleted in Server: [${emoji.guild.id}].`);
	}
};
