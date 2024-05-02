import { Events, GuildScheduledEvent } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { Event } from '../../structures';
import { EgglordEmbed } from '../../utils';

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
		if (client.config.debug) client.logger.debug(`Event: ${guildEvent.name} has been created in guild: ${guildEvent.guild?.id}.`);

		// Check if event emojiCreate is for logging
		const moderationSettings = guildEvent.guild?.settings?.moderationSystem;
		if (moderationSettings && moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) {
			const embed = new EgglordEmbed(client, guildEvent.guild)
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
				if (moderationSettings.loggingChannelId == null) return;
				const modChannel = await guildEvent.guild.channels.fetch(moderationSettings.loggingChannelId);
				if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}

