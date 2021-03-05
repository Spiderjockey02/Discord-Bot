// Dependencies
const { MessageEmbed } = require('discord.js');

// send message to log channel
function sendMessage(newGuild, settings, embed) {
	const modChannel = newGuild.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel);
	if (modChannel)	modChannel.send(embed);
}

module.exports = async (bot, oldGuild, newGuild) => {
	// Get server settings / if no settings then return
	const settings = newGuild.guild.settings;
	if (Object.keys(settings).length == 0) return;

	let embed;
	// Check if event guildUpdate is for logging
	if (settings.ModLog & settings.ModLogEvents.includes('GUILDUPDATE')) {

		// Guild name change
		if (oldGuild.name != newGuild.name) {
			embed = new MessageEmbed()
				.setDescription('**Server name changed**')
				.setAuthor(newGuild.name, newGuild.iconURL())
				.addField('Before:', oldGuild.name)
				.addField('After:', newGuild.name)
				.setTimestamp();
			bot.updateGuild(newGuild, { guildName: newGuild.name });
			sendMessage(newGuild, settings, embed);
		}

		// region change
		if (oldGuild.region != newGuild.region) {
			embed = new MessageEmbed()
				.setDescription('**Server region changed**')
				.setAuthor(newGuild.name, newGuild.iconURL())
				.addField('Before:', oldGuild.region)
				.addField('After:', newGuild.region)
				.setTimestamp();
			sendMessage(newGuild, settings, embed);
		}

		// Server's boost level has increased
		if (oldGuild.premiumTier < newGuild.premiumTier) {
			embed = new MessageEmbed()
				.setDescription('**Server boost increased**')
				.setAuthor(newGuild.name, newGuild.iconURL())
				.addField('Before:', oldGuild.premiumTier)
				.addField('After:', newGuild.premiumTier)
				.setTimestamp();
			sendMessage(newGuild, settings, embed);
		}

		// Server's boost level has decreased
		if (oldGuild.premiumTier > newGuild.premiumTier) {
			embed = new MessageEmbed()
				.setDescription('**Server boost decreased**')
				.setAuthor(newGuild.name, newGuild.iconURL())
				.addField('Before:', oldGuild.premiumTier)
				.addField('After:', newGuild.premiumTier)
				.setTimestamp();
			sendMessage(newGuild, settings, embed);
		}

		// Server has got a new banner
		if (!oldGuild.banner && newGuild.banner) {
			embed = new MessageEmbed()
				.setDescription('**Server banner changed**')
				.setAuthor(newGuild.name, newGuild.iconURL())
				.addField('Before:', oldGuild.banner)
				.addField('After:', newGuild.banner)
				.setTimestamp();
			sendMessage(newGuild, settings, embed);
		}

		// Server has made a AFK channel
		if (!oldGuild.afkChannel && newGuild.afkChannel) {
			embed = new MessageEmbed()
				.setDescription('**Server AFK channel changed**')
				.setAuthor(newGuild.name, newGuild.iconURL())
				.addField('Before:', oldGuild.afkChannel)
				.addField('After:', newGuild.afkChannel)
				.setTimestamp();
			sendMessage(newGuild, settings, embed);
		}

		// Server now has a vanity URL
		if (!oldGuild.vanityURLCode && newGuild.vanityURLCode) {
			embed = new MessageEmbed()
				.setDescription('**Server Vanity URL changed**')
				.setAuthor(newGuild.name, newGuild.iconURL())
				.addField('Before:', oldGuild.vanityURLCode)
				.addField('After:', newGuild.vanityURLCode)
				.setTimestamp();
			sendMessage(newGuild, settings, embed);
		}
	}
};
