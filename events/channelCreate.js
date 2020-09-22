// When a channel has been created
const Discord = require('discord.js');

module.exports = async (bot, channel) => {
	// When someone DM's the bot for the first time, this event gets triggered (just make sure its not a DM)
	if (channel.type == 'dm') return;
	// Get server settings
	let settings;
	try {
		settings = await bot.getGuild(channel.guild);
	}
	catch (e) {
		console.log(e);
	}
	// Check if ModLog plugin is active
	if (settings.ModLog == false) return;
	// Check if event channelCreate is for logging
	if (settings.ModLogEvents.includes('CHANNELCREATE')) {
		const embed = new Discord.MessageEmbed()
			.setDescription(`**${channel.type === 'category' ? 'Category' : 'Channel'} Created: ${channel.toString()}**`)
			.setColor(3066993)
			.setFooter(`ID: ${channel.id}`)
			.setAuthor(bot.user.username, bot.user.displayAvatarURL())
			.setTimestamp();
		// Find channel and send message
		const modChannel = channel.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel);
		if (modChannel) modChannel.send(embed);
		// log event in console
		bot.logger.log(`Channel: ${channel.name} has been deleted in Server: [${channel.guild.id}].`);
	}
};
