// Dependencies
const { Embed } = require('../../utils'),
	Event = require('../../structures/Event');

/**
 * Guild event update event
 * @event Egglord#guildScheduledEventUpdate
 * @extends {Event}
*/
class GuildScheduledEventUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {guildScheduledEvent} oldGuildEvent The guild event before update
	 * @param {guildScheduledEvent} newGuildEvent The guild event after update
	 * @readonly
	*/
	async run(bot, oldGuildEvent, newGuildEvent) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Event: ${newGuildEvent.name} has been updated in guild: ${newGuildEvent.guild.id}.`);

		// Get server settings / if no settings then return
		const settings = newGuildEvent.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildEventCreate is for logging
		if (settings.ModLogEvents?.includes('EVENTUPDATE') && settings.ModLog) {
			const embed = new Embed(bot, newGuildEvent.guild)
				.setColor(15158332);
			// guild event name has changed
			if (oldGuildEvent.name != newGuildEvent.name) {
				embed.addField('Name change', `${oldGuildEvent.name} -> ${newGuildEvent.name}`);
			}
			// guild event description has changed
			if (oldGuildEvent.description != newGuildEvent.description) {
				embed.addField('Description change', `${oldGuildEvent.description} -> ${newGuildEvent.description}`);
			}
			// guild event start date has changed
			if (oldGuildEvent.scheduledStartAt != newGuildEvent.scheduledStartAt) {
				embed.addField('Start time change', `${oldGuildEvent.scheduledStartAt.toLocaleString(settings.Language)} -> ${newGuildEvent.scheduledStartAt.toLocaleString(settings.Language)}`);
			}
			// guild event end date has changed
			if (oldGuildEvent.scheduledEndAt != newGuildEvent.scheduledEndAt) {
				embed.addField('End time change', `${oldGuildEvent.scheduledEndAt.toLocaleString(settings.Language)} -> ${newGuildEvent.scheduledEndAt.toLocaleString(settings.Language)}`);
			}
			// guild event has changed status
			if (oldGuildEvent.status != newGuildEvent.status) {
				embed.addField('Status change', `${oldGuildEvent.status} -> ${newGuildEvent.status}`);
			}
			// guild event has changed location
			if (oldGuildEvent.entityType != newGuildEvent.entityType) {
				const oldEntityType = (['STAGE_INSTANCE', 'VOICE'].includes(oldGuildEvent.entityType)) ? oldGuildEvent.channel : oldGuildEvent.entityType;
				const newEntityType = (['STAGE_INSTANCE', 'VOICE'].includes(newGuildEvent.entityType)) ? newGuildEvent.channel : newGuildEvent.entityType;
				embed.addField('Type change', `${oldEntityType} -> ${newEntityType}`);
			}

			embed.setDescription(`**Event: ${newGuildEvent.name} has been updated.**`)
				.setFooter({ text: newGuildEvent.guild.translate('misc:ID', { ID: newGuildEvent.guild.id }) })
				.setAuthor({ name: bot.user.username, iconURL: bot.user.displayAvatarURL() })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${newGuildEvent.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == newGuildEvent.guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}

module.exports = GuildScheduledEventUpdate;
