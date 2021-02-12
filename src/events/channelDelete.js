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

	// Check if event channelDelete is for logging
	if (settings.ModLogEvents.includes('CHANNELDELETE') && settings.ModLog) {
		const embed = new MessageEmbed()
			.setDescription(`**${channel.type.charAt(0).toUpperCase() + channel.type.slice(1)} Deleted: ${'#' + channel.name}**`)
			.setColor(15158332)
			.setFooter(`ID: ${channel.id}`)
			.setAuthor(bot.user.username, bot.user.displayAvatarURL())
			.setTimestamp();

		// Find channel and send message
		const modChannel = channel.guild.channels.cache.get(settings.ModLogChannel);
		if (modChannel) modChannel.send(embed);
	}
};
