// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports = async (bot, channel) => {
	// Don't really know but a check for DM must be made
	if (channel.type == 'dm') return;
	// Get server settings
	let settings;
	try {
		settings = await bot.getGuild(channel.guild);
	} catch (e) {
		console.log(e);
	}
	// Check if ModLog plugin is active
	if (settings.ModLog == false) return;
	// Check if event channelDelete is for logging
	if (settings.ModLogEvents.includes('CHANNELDELETE')) {
		const embed = new MessageEmbed()
			.setDescription(`**${channel.type.charAt(0).toUpperCase() + channel.type.slice(1)} Deleted: ${'#' + channel.name}**`)
			.setColor(15158332)
			.setFooter(`ID: ${channel.id}`)
			.setAuthor(bot.user.username, bot.user.displayAvatarURL())
			.setTimestamp();
		const modChannel = channel.guild.channels.cache.find(c => c.id == settings.ModLogChannel);
		if (modChannel) modChannel.send(embed);
		// log event in console
		bot.logger.log(`Channel: ${channel.name} has been deleted in Server: [${channel.guild.id}].`);
	}
};
