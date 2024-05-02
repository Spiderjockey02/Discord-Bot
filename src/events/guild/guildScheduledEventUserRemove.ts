import { Event } from '../../structures';
import { Events, GuildScheduledEvent, User } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { EgglordEmbed } from '../../utils';

/**
 * Guild event user remove event
 * @event Egglord#guildScheduledEventUserRemove
 * @extends {Event}
*/
export default class GuildScheduledEventUserRemove extends Event {
	constructor() {
		super({
			name: Events.GuildScheduledEventUserRemove,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {guildScheduledEvent} guildEvent The guild event the user left
	 * @param {User} user The user who left the event
	 * @readonly
	*/
	async run(client: EgglordClient, guildEvent: GuildScheduledEvent, user: User) {
		// For debugging
		if (client.config.debug) client.logger.debug(`User: ${user.displayName} has left event: ${guildEvent.name} in guild: ${guildEvent.guild?.id}.`);

		// Check if event guildEventCreate is for logging
		const moderationSettings = guildEvent.guild?.settings?.moderationSystem;
		if (moderationSettings && moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) {
			const embed = new EgglordEmbed(client, guildEvent.guild)
				.setDescription([
					`${user.displayName} left event: [${guildEvent.name}](${guildEvent})`,
					'',
					`There are still ${guildEvent.userCount ?? 0} users subscribed to the event.`,
				].join('\n'))
				.setColor(15158332)
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
