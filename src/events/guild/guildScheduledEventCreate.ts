import { Events, GuildScheduledEvent } from 'discord.js';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';

/**
 * Guild event create event
 * @event Egglord#guildScheduledEventCreate
 * @extends {Event}
*/
export default class GuildScheduledEventCreate extends Event {
	constructor() {
		super({
			name: Events.GuildScheduledEventCreate,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {guildScheduledEvent} guildEvent The guild event that was created
	 * @readonly
	*/
	async run(client: EgglordClient, guildEvent: GuildScheduledEvent) {
		// For debugging
		if (client.config.debug) client.logger.debug(`Event: ${guildEvent.name} has been created in guild: ${guildEvent.guild.id}.`);

		// Get server settings / if no settings then return
		const settings = guildEvent.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildEventCreate is for logging
		if (settings.ModLogEvents?.includes('EVENTCREATE') && settings.ModLog) {
			const embed = new Embed(client, guildEvent.guild)
				.setDescription([
					`**Event: ${guildEvent.name} has been created.**`,
					`Starts at: ${guildEvent.scheduledStartAt}`,
					`Ends at ${guildEvent.scheduledEndAt}`,
				].join('\n'))
				.setColor(3066993)
				.setFooter({ text: guildEvent.guild.translate('misc:ID', { ID: guildEvent.guild.id }) })
				.setAuthor({ name: client.user.displayName, iconURL: client.user.displayAvatarURL() })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await client.channels.fetch(settings.ModLogChannel).catch(() => client.logger.error(`Error fetching guild: ${guildEvent.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == guildEvent.guild.id) client.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}

