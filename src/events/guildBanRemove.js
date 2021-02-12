// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports = async (bot, guild, user) => {
	let settings;
	try {
		settings = await bot.getGuild(guild);
	} catch (e) {
		console.log(e);
	}

	// Check if event guildBanRemove is for logging
	if (settings.ModLogEvents.includes('GUILDBANREMOVE') && settings.ModLog) {
		const embed = new MessageEmbed()
			.setDescription(`${user.toString()}\n${user.tag}`)
			.setFooter(`ID: ${user.id}`)
			.setThumbnail(`${user.displayAvatarURL()}`)
			.setAuthor('User: Unbanned')
			.setTimestamp();

		// Find channel and send message
		const modChannel = guild.channels.cache.get(settings.ModLogChannel);
		if (modChannel) modChannel.send(embed);
	}
};
