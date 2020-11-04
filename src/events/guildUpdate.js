// Dependencies
const { MessageEmbed } = require('discord.js');

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
		embed = new MessageEmbed()
			.setDescription('**Server name changed**')
			.setAuthor(newGuild.name, newGuild.iconURL())
			.addField('Before:', oldGuild.name)
			.addField('After:', newGuild.name)
			.setTimestamp();
		bot.updateGuild(newGuild, { guildName: newGuild.name });
	}
	// region change
	if (oldGuild.region != newGuild.region) {
		embed = new MessageEmbed()
			.setDescription('**Server region changed**')
			.setAuthor(newGuild.name, newGuild.iconURL())
			.addField('Before:', oldGuild.region)
			.addField('After:', newGuild.region)
			.setTimestamp();
	}
	// Server's boost level has increased
	if (oldGuild.premiumTier < newGuild.premiumTier) {
		embed = new MessageEmbed()
			.setDescription('**Server boost increased**')
			.setAuthor(newGuild.name, newGuild.iconURL())
			.addField('Before:', oldGuild.premiumTier)
			.addField('After:', newGuild.premiumTier)
			.setTimestamp();
	}
	// Server's boost level has decreased
	if (oldGuild.premiumTier > newGuild.premiumTier) {
		embed = new MessageEmbed()
			.setDescription('**Server boost decreased**')
			.setAuthor(newGuild.name, newGuild.iconURL())
			.addField('Before:', oldGuild.premiumTier)
			.addField('After:', newGuild.premiumTier)
			.setTimestamp();
	}
	// Server has got a new banner
	if (!oldGuild.banner && newGuild.banner) {
		embed = new MessageEmbed()
			.setDescription('**Server banner changed**')
			.setAuthor(newGuild.name, newGuild.iconURL())
			.addField('Before:', oldGuild.banner)
			.addField('After:', newGuild.banner)
			.setTimestamp();
	}
	// Server has made a AFK channel
	if (!oldGuild.afkChannel && newGuild.afkChannel) {
		embed = new MessageEmbed()
			.setDescription('**Server AFK channel changed**')
			.setAuthor(newGuild.name, newGuild.iconURL())
			.addField('Before:', oldGuild.afkChannel)
			.addField('After:', newGuild.afkChannel)
			.setTimestamp();
	}
	// Server now has a vanity URL
	if (!oldGuild.vanityURLCode && newGuild.vanityURLCode) {
		embed = new MessageEmbed()
			.setDescription('**Server Vanity URL changed**')
			.setAuthor(newGuild.name, newGuild.iconURL())
			.addField('Before:', oldGuild.vanityURLCode)
			.addField('After:', newGuild.vanityURLCode)
			.setTimestamp();
	}
	// Check if event channelDelete is for logging
	if (settings.ModLog & settings.ModLogEvents.includes('GUILDUPDATE')) {
		sendMessage(newGuild, settings, embed);
	}

	// log event in console
	bot.logger.log(`Guild: ${newGuild.name} has been updated.`);
};
