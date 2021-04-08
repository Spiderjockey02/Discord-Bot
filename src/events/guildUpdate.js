// Dependencies
const { MessageEmbed } = require('discord.js'),
	Event = require('../structures/Event');

module.exports = class guildUpdate extends Event {
	async run(bot, oldGuild, newGuild) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Guild: ${newGuild.name} has been updated.`);

		// Get server settings / if no settings then return
		const settings = newGuild.settings;
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
				newGuild.updateGuild({ guildName: newGuild.name });
				settings.guildName = newGuild.name;
				const modChannel = newGuild.channels.cache.get(settings.ModLogChannel);
				if (modChannel)	require('../helpers/webhook-manager')(bot, modChannel.id, embed);
			}

			// region change
			if (oldGuild.region != newGuild.region) {
				embed = new MessageEmbed()
					.setDescription('**Server region changed**')
					.setAuthor(newGuild.name, newGuild.iconURL())
					.addField('Before:', oldGuild.region)
					.addField('After:', newGuild.region)
					.setTimestamp();
				const modChannel = newGuild.channels.cache.get(settings.ModLogChannel);
				if (modChannel) require('../helpers/webhook-manager')(bot, modChannel.id, embed);
			}

			// Server's boost level has changed
			if (oldGuild.premiumTier != newGuild.premiumTier) {
				embed = new MessageEmbed()
					.setDescription(`**Server boost ${oldGuild.premiumTier < newGuild.premiumTier ? 'increased' : 'decreased'}**`)
					.setAuthor(newGuild.name, newGuild.iconURL())
					.addField('Before:', oldGuild.premiumTier)
					.addField('After:', newGuild.premiumTier)
					.setTimestamp();
				const modChannel = newGuild.channels.cache.get(settings.ModLogChannel);
				if (modChannel) require('../helpers/webhook-manager')(bot, modChannel.id, embed);
			}

			// Server has got a new banner
			if (!oldGuild.banner && newGuild.banner) {
				embed = new MessageEmbed()
					.setDescription('**Server banner changed**')
					.setAuthor(newGuild.name, newGuild.iconURL())
					.addField('Before:', oldGuild.banner)
					.addField('After:', newGuild.banner)
					.setTimestamp();
				const modChannel = newGuild.channels.cache.get(settings.ModLogChannel);
				if (modChannel)	require('../helpers/webhook-manager')(bot, modChannel.id, embed);
			}

			// Server has made a AFK channel
			if (!oldGuild.afkChannel && newGuild.afkChannel) {
				embed = new MessageEmbed()
					.setDescription('**Server AFK channel changed**')
					.setAuthor(newGuild.name, newGuild.iconURL())
					.addField('Before:', oldGuild.afkChannel)
					.addField('After:', newGuild.afkChannel)
					.setTimestamp();
				const modChannel = newGuild.channels.cache.get(settings.ModLogChannel);
				if (modChannel)	require('../helpers/webhook-manager')(bot, modChannel.id, embed);
			}

			// Server now has a vanity URL
			if (!oldGuild.vanityURLCode && newGuild.vanityURLCode) {
				embed = new MessageEmbed()
					.setDescription('**Server Vanity URL changed**')
					.setAuthor(newGuild.name, newGuild.iconURL())
					.addField('Before:', oldGuild.vanityURLCode)
					.addField('After:', newGuild.vanityURLCode)
					.setTimestamp();
				const modChannel = newGuild.channels.cache.get(settings.ModLogChannel);
				if (modChannel)	require('../helpers/webhook-manager')(bot, modChannel.id, embed);
			}
		}
	}
};
