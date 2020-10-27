// When the server has been updated
const Discord = require('discord.js');

// send message to log channel
function sendMessage(newGuild, settings, embed) {
	const modChannel = newGuild.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel);
	if (modChannel)	modChannel.send(embed);
}

module.exports = async (bot, oldGuild, newGuild) => {
	// Get server settings
	let settings;
	try {
		settings = await bot.getGuild(newGuild);
	} catch (e) {
		console.log(e);
	}

	// Check for updates
	let embed;
	if (oldGuild.name != newGuild.name) {
		embed = new Discord.MessageEmbed()
			.setDescription('**Server name changed**')
			.setAuthor(newGuild.name, newGuild.iconURL())
			.addField('Before:', oldGuild.name)
			.addField('After:', newGuild.name)
			.setTimestamp();
		bot.updateGuild(newGuild, { guildName: newGuild.name });
	}
	// region change
	if (oldGuild.region != newGuild.region) {
		embed = new Discord.MessageEmbed()
			.setDescription('**Server region changed**')
			.setAuthor(newGuild.name, newGuild.iconURL())
			.addField('Before:', oldGuild.region)
			.addField('After:', newGuild.region)
			.setTimestamp();
	}
	// Check if event channelDelete is for logging
	if (settings.ModLog & settings.ModLogEvents.includes('GUILDUPDATE')) {
		sendMessage(newGuild, settings, embed);
	}

	// log event in console
	bot.logger.log(`Guild: ${newGuild.name} has been updated.`);
};
