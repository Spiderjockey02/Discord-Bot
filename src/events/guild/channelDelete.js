// Dependencies
const { MessageEmbed } = require('discord.js'),
	Event = require('../../structures/Event');

module.exports = class channelDelete extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, channel) {
	// For debugging
		if (bot.config.debug) bot.logger.debug(`Channel: ${channel.type == 'dm' ? channel.recipient.tag : channel.name} has been deleted${channel.type == 'dm' ? '' : ` in guild: ${channel.guild.id}`}. (${channel.type})`);

		// Don't really know but a check for DM must be made
		if (channel.type == 'dm') return;

		// Get server settings / if no settings then return
		const settings = channel.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// IF it's a ticket channel and TICKET logging is enabled then don't show CHANNELDELETE log
		const regEx = /ticket-\d{18}/g;
		if (regEx.test(channel.name) && settings.ModLogEvents.includes('TICKET')) return await bot.emit('ticketClose', channel);

		// Check if event channelDelete is for logging
		if (settings.ModLogEvents.includes('CHANNELDELETE') && settings.ModLog) {
			const embed = new MessageEmbed()
				.setDescription(`**${channel.type.charAt(0).toUpperCase() + channel.type.slice(1)} Deleted: ${'#' + channel.name}**`)
				.setColor(15158332)
				.setFooter(`ID: ${channel.id}`)
				.setAuthor(bot.user.username, bot.user.displayAvatarURL())
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${channel.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == channel.guild.id) bot.addEmbed(modChannel.id, embed);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
};
