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

	// Check if event roleCreate is for logging
	if (settings.ModLogEvents.includes('ROLECREATE') && settings.ModLog) {
		const embed = new MessageEmbed()
			.setDescription(`**Role: ${role} (${role.name}) was created**`)
			.setColor(3066993)
			.setFooter(`ID: ${role.id}`)
			.setAuthor(role.guild.name, role.guild.iconURL())
			.setTimestamp();

		// Find channel and send message
		const modChannel = role.guild.channels.cache.get(settings.ModLogChannel);
		if (modChannel) modChannel.send(embed);
	}
};
