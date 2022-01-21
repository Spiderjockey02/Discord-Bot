// Dependencies
const { Embed } = require('../../utils'),
	Event = require('../../structures/Event');

/**
 * Guild event delete event
 * @event Egglord#guildScheduledEventDelete
 * @extends {Event}
*/
class GuildScheduledEventDelete extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {guildScheduledEvent} guildEvent The guild event that was deleted
	 * @readonly
	*/
	async run(bot, guildEvent) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Event: ${guildEvent.name} has been deleted in guild: ${guildEvent.guild.id}.`);

		// Get server settings / if no settings then return
		const settings = guildEvent.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildEventCreate is for logging
		if (settings.ModLogEvents?.includes('EVENTDELETE') && settings.ModLog) {
			const embed = new Embed(bot, guildEvent.guild)
				.setDescription(`**Event: ${guildEvent.name} has been deleted.**`)
				.setColor(15158332)
				.setFooter({ text: guildEvent.guild.translate('misc:ID', { ID: guildEvent.guild.id }) })
				.setAuthor({ name: bot.user.username, iconURL: bot.user.displayAvatarURL() })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${guildEvent.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == guildEvent.guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}

module.exports = GuildScheduledEventDelete;
