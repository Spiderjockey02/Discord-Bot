// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports = async (bot, guild, user) => {
	// For debugging
	if (bot.config.debug) bot.logger.debug(`Member: ${user.tag} has been banned in guild: ${guild.id}.`);

	// Get server settings / if no settings then return
	const settings = guild.settings;
	if (Object.keys(settings).length == 0) return;

	// Check if event guildBanAdd is for logging
	if (settings.ModLogEvents.includes('GUILDBANADD') && settings.ModLog) {
		const embed = new MessageEmbed()
			.setDescription(`${user.toString()}\n${user.tag}`)
			.setFooter(`ID: ${user.id}`)
			.setThumbnail(`${user.displayAvatarURL()}`)
			.setAuthor('User: Banned')
			.setTimestamp();

		// Find channel and send message
		const modChannel = guild.channels.cache.get(settings.ModLogChannel);
		if (modChannel) modChannel.send(embed);
	}
};
