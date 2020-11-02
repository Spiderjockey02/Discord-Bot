// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports = async (bot, guild, user) => {
	let settings;
	try {
		settings = await bot.getGuild(guild);
	} catch (e) {
		console.log(e);
	}
	// Check if moderation plugin is on
	if (settings.ModLog == false) return;
	// Check if moderation channel is valid
	if (settings.ModLogEvents.includes('GUILDBANADD')) {
		const embed = new MessageEmbed()
			.setDescription(`${user.toString()}\n${user.tag}`)
			.setFooter(`ID: ${user.id}`)
			.setThumbnail(`${user.displayAvatarURL()}`)
			.setAuthor('User: Banned')
			.setTimestamp();
		const modChannel = guild.channels.cache.find(channel => channel.id == settings.ModLogChannel);
		if (modChannel) modChannel.send(embed);
		// log event in console
		bot.logger.log(`Guild member: ${user.username} has been banned from Server: [${user.guild.id}].`);
	}
};
