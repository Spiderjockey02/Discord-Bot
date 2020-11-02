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
	if (settings.ModLogEvents.includes('ROLEDELETE')) {
		try {
			const embed = new MessageEmbed()
				.setDescription(`**Role: ${role} (${role.name}) was deleted**`)
				.setColor(15158332)
				.setFooter(`ID: ${role.id}`)
				.setAuthor(role.guild.name, role.guild.iconURL())
				.setTimestamp();
			role.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel).send(embed);
		} catch (e) {
			return;
		}
	}
	// log event in console
	bot.logger.log(`Role: ${role.name} has been deleted in Server: [${role.guild.id}].`);
};
