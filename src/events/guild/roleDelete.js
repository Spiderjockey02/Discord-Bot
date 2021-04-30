// Dependencies
const { MessageEmbed } = require('discord.js'),
	Event = require('../../structures/Event');

module.exports = class roleDelete extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
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
			try {
				const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${role.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == role.guild.id) bot.addEmbed(modChannel.id, embed);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
};
