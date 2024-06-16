import { Colors, Events, GuildScheduledEvent } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { Event, EgglordEmbed } from '../../structures';

/**
 * Guild event delete event
 * @event Egglord#guildScheduledEventDelete
 * @extends {Event}
*/
export default class GuildScheduledEventDelete extends Event {
	constructor() {
		super({
			name: Events.GuildScheduledEventDelete,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {guildScheduledEvent} guildEvent The guild event that was deleted
	 * @readonly
	*/
	async run(client: EgglordClient, guildEvent: GuildScheduledEvent) {
		// For debugging
		if (client.config.debug) client.logger.debug(`Event: ${guildEvent.name} has been deleted in guild: ${guildEvent.guild?.id}.`);

		// Check if event guildEventCreate is for logging
		const moderationSettings = guildEvent.guild?.settings?.moderationSystem;
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;

		const embed = new EgglordEmbed(client, guildEvent.guild)
			.setDescription(`**Event: ${guildEvent.name} has been deleted.**`)
			.setColor(Colors.Red)
			.setFooter({ text: client.languageManager.translate(guildEvent.guild, 'misc:ID', { ID: guildEvent.guild.id }) })
			.setAuthor({ name: client.user.displayName, iconURL: client.user.displayAvatarURL() })
			.setTimestamp();

		// Find channel and send message
		try {
			if (moderationSettings.loggingChannelId == null) return;
			const modChannel = await guildEvent.guild.channels.fetch(moderationSettings.loggingChannelId);
			if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
		} catch (err) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
		}
	}
}