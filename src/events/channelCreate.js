// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports = async (bot, channel) => {
	// Make sure the channel isn't a DM
	if (channel.type == 'dm') return;

	// Get server settings / if no settings then return
	const settings = channel.guild.settings;
	if (Object.keys(settings).length == 0) return;

	// Check if event channelCreate is for logging
	if (settings.ModLogEvents.includes('CHANNELCREATE') && settings.ModLog) {
		const embed = new MessageEmbed()
			.setDescription(`**${channel.type.charAt(0).toUpperCase() + channel.type.slice(1)} Created: ${channel.toString()}**`)
			.setColor(3066993)
			.setFooter(`ID: ${channel.id}`)
			.setAuthor(bot.user.username, bot.user.displayAvatarURL())
			.setTimestamp();

		// Find channel and send message
		const modChannel = channel.guild.channels.cache.get(settings.ModLogChannel);
		if (modChannel) modChannel.send(embed);
	}
};
