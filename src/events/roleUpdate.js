// Dependencies
const { MessageEmbed } = require('discord.js'),
	Event = require('../structures/Event');

module.exports = class roleUpdate extends Event {
	async run(bot, oldRole, newRole) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Role: ${newRole.name} has been updated in guild: ${newRole.guild.id}.`);

		// Get server settings / if no settings then return
		const settings = newRole.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event roleUpdate is for logging
		if (settings.ModLogEvents.includes('ROLEUPDATE') && settings.ModLog) {

			// role name change
			if (oldRole.name != newRole.name) {
				const embed = new MessageEmbed()
					.setDescription(`**Role name of ${newRole} (${newRole.name}) changed**`)
					.setColor(15105570)
					.setFooter(`ID: ${newRole.id}`)
					.setAuthor(newRole.guild.name, newRole.guild.iconURL())
					.addField('Before:', oldRole.name)
					.addField('After:', newRole.name)
					.setTimestamp();
				const modChannel = newRole.guild.channels.cache.get(settings.ModLogChannel);
				if (modChannel) require('../helpers/webhook-manager')(bot, modChannel.id, embed);
			}

			// role colour change
			if (oldRole.color != newRole.color) {
				const embed = new MessageEmbed()
					.setDescription(`**Role name of ${newRole} (${newRole.name}) changed**`)
					.setColor(15105570)
					.setFooter(`ID: ${newRole.id}`)
					.setAuthor(newRole.guild.name, newRole.guild.iconURL())
					.addField('Before:', `${oldRole.color} ([${oldRole.hexColor}](https://www.color-hex.com/color/${oldRole.hexColor.slice(1)}))`)
					.addField('After:', `${newRole.color} ([${newRole.hexColor}](https://www.color-hex.com/color/${newRole.hexColor.slice(1)}))`)
					.setTimestamp();
				const modChannel = newRole.guild.channels.cache.get(settings.ModLogChannel);
				if (modChannel) require('../helpers/webhook-manager')(bot, modChannel.id, embed);
			}

			// role permission change
			if (oldRole.permissions != newRole.permissions) {
				const embed = new MessageEmbed()
					.setDescription(`**Role permissions of ${newRole} (${newRole.name}) changed**\n[What those numbers mean](https://discordapi.com/permissions.html#${oldRole.permissions.bitfield})`)
					.setColor(15105570)
					.setFooter(`ID: ${newRole.id}`)
					.setAuthor(newRole.guild.name, newRole.guild.iconURL())
					.addField('Before:', oldRole.permissions.bitfield)
					.addField('After:', newRole.permissions.bitfield)
					.setTimestamp();
				const modChannel = newRole.guild.channels.cache.get(settings.ModLogChannel);
				if (modChannel) require('../helpers/webhook-manager')(bot, modChannel.id, embed);
			}
		}
	}
};
