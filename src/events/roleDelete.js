// Dependencies
const { MessageEmbed } = require('discord.js'),
	Event = require('../structures/Event');

module.exports = class roleDelete extends Event {
	async run(bot, role) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Role: ${role.name} has been deleted in guild: ${role.guild.id}.`);

		// Get server settings / if no settings then return
		const settings = role.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event roleDelete is for logging
		if (settings.ModLogEvents.includes('ROLEDELETE') && settings.ModLog) {
			const embed = new MessageEmbed()
				.setDescription(`**Role: ${role} (${role.name}) was deleted**`)
				.setColor(15158332)
				.setFooter(`ID: ${role.id}`)
				.setAuthor(role.guild.name, role.guild.iconURL())
				.setTimestamp();

			// Find channel and send message
			const modChannel = role.guild.channels.cache.get(settings.ModLogChannel);
			if (modChannel) require('../helpers/webhook-manager')(bot, modChannel.id, embed);
		}
	}
};
