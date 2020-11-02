// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports = async (bot, role) => {
	// Get server settings
	let settings;
	try {
		settings = await bot.getGuild(role.guild);
	} catch (e) {
		console.log(e);
	}
	// Check if ModLog plugin is active
	if (settings.ModLog == false) return;
	// Check if event channelCreate is for logging
	if (settings.ModLogEvents.includes('ROLECREATE')) {
		const embed = new MessageEmbed()
			.setDescription(`**Role: ${role} (${role.name}) was created**`)
			.setColor(3066993)
			.setFooter(`ID: ${role.id}`)
			.setAuthor(role.guild.name, role.guild.iconURL())
			.setTimestamp();
		// send message
		const modChannel = role.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel);
		if (modChannel) modChannel.send(embed);
	}
	// log event in console
	bot.logger.log(`Role: ${role.name} has been created in Server: [${role.guild.id}].`);
};
