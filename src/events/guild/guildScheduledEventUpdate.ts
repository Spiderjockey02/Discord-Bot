import Event from 'src/structures/Event';
import { Events, GuildScheduledEvent } from 'discord.js';
import EgglordClient from 'src/base/Egglord';

/**
 * Guild event update event
 * @event Egglord#guildScheduledEventUpdate
 * @extends {Event}
*/
export default class GuildScheduledEventUpdate extends Event {
	constructor() {
		super({
			name: Events.GuildScheduledEventUpdate,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {guildScheduledEvent} oldGuildEvent The guild event before update
	 * @param {guildScheduledEvent} newGuildEvent The guild event after update
	 * @readonly
	*/
	async run(client: EgglordClient, oldGuildEvent: GuildScheduledEvent, newGuildEvent: GuildScheduledEvent) {
		// For debugging
		if (client.config.debug) client.logger.debug(`Event: ${newGuildEvent.name} has been updated in guild: ${newGuildEvent.guild.id}.`);

		// Get server settings / if no settings then return
		const settings = newGuildEvent.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildEventCreate is for logging
		if (settings.ModLogEvents?.includes('EVENTUPDATE') && settings.ModLog) {
			const embed = new Embed(client, newGuildEvent.guild)
				.setColor(15158332);
			// guild event name has changed
			if (oldGuildEvent.name != newGuildEvent.name) {
				embed.addFields({ name: 'Name change', value: `${oldGuildEvent.name} -> ${newGuildEvent.name}` });
			}
			// guild event description has changed
			if (oldGuildEvent.description != newGuildEvent.description) {
				embed.addFields({ name: 'Description change', value: `${oldGuildEvent.description} -> ${newGuildEvent.description}` });
			}
			// guild event start date has changed
			if (oldGuildEvent.scheduledStartAt != newGuildEvent.scheduledStartAt) {
				embed.addFields({ name: 'Start time change', value: `${oldGuildEvent.scheduledStartAt.toLocaleString(settings.Language)} -> ${newGuildEvent.scheduledStartAt.toLocaleString(settings.Language)}` });
			}
			// guild event end date has changed
			if (oldGuildEvent.scheduledEndAt != newGuildEvent.scheduledEndAt) {
				embed.addFields({ name: 'End time change', value: `${oldGuildEvent.scheduledEndAt.toLocaleString(settings.Language)} -> ${newGuildEvent.scheduledEndAt.toLocaleString(settings.Language)}` });
			}
			// guild event has changed status
			if (oldGuildEvent.status != newGuildEvent.status) {
				embed.addFields({ name: 'Status change', value: `${oldGuildEvent.status} -> ${newGuildEvent.status}` });
			}
			// guild event has changed location
			if (oldGuildEvent.entityType != newGuildEvent.entityType) {
				const oldEntityType = (['STAGE_INSTANCE', 'VOICE'].includes(oldGuildEvent.entityType)) ? oldGuildEvent.channel : oldGuildEvent.entityType;
				const newEntityType = (['STAGE_INSTANCE', 'VOICE'].includes(newGuildEvent.entityType)) ? newGuildEvent.channel : newGuildEvent.entityType;
				embed.addFields({ name: 'Type change', value: `${oldEntityType} -> ${newEntityType}` });
			}

			embed.setDescription(`**Event: ${newGuildEvent.name} has been updated.**`)
				.setFooter({ text: newGuildEvent.guild.translate('misc:ID', { ID: newGuildEvent.guild.id }) })
				.setAuthor({ name: client.user.displayName, iconURL: client.user.displayAvatarURL() })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await client.channels.fetch(settings.ModLogChannel).catch(() => client.logger.error(`Error fetching guild: ${newGuildEvent.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == newGuildEvent.guild.id) client.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
