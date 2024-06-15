import { Colors, Events, GuildScheduledEvent } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { Event, EgglordEmbed } from '../../structures';

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
		client.logger.debug(`Event: ${guildEvent.name} has been created in guild: ${guildEvent.guild?.id}.`);

		// Check if event emojiCreate is for logging
		const moderationSettings = guildEvent.guild?.settings?.moderationSystem;
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;

		const embed = new EgglordEmbed(client, guildEvent.guild)
			.setDescription(
				client.languageManager.translate(guildEvent.guild, 'events/guild:EVENT_START_DESC', { NAME: guildEvent.name, START_AT: `${guildEvent.scheduledStartAt}`, END_AT: `${guildEvent.scheduledEndAt}` }),
			)
			.setColor(Colors.Green)
			.setFooter({ text: client.languageManager.translate(guildEvent.guild, 'misc:ID', { ID: guildEvent.guild.id }) })
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

