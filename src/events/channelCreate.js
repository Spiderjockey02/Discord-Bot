// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports = async (bot, channel) => {
	// Make sure the channel isn't a DM
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
	// Check if event channelCreate is for logging
	if (settings.ModLogEvents.includes('CHANNELCREATE')) {
		const embed = new MessageEmbed()
			.setDescription(`**${channel.type.charAt(0).toUpperCase() + channel.type.slice(1)} Created: ${channel.toString()}**`)
			.setColor(3066993)
			.setFooter(`ID: ${channel.id}`)
			.setAuthor(bot.user.username, bot.user.displayAvatarURL())
			.setTimestamp();
		// Find channel and send message
		const modChannel = channel.guild.channels.cache.find(c => c.id == settings.ModLogChannel);
		if (modChannel) modChannel.send(embed);
		// log event in console
		bot.logger.log(`Channel: ${channel.name} has been created in Server: [${channel.guild.id}].`);
	}
};
