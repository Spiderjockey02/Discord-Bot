import { Event, EgglordEmbed } from '../../structures';
import { Colors, Events, GuildScheduledEvent, User } from 'discord.js';
import EgglordClient from '../../base/Egglord';

/**
 * Guild event user join event
 * @event Egglord#guildScheduledEventUserAdd
 * @extends {Event}
*/
export default class GuildScheduledEventUserAdd extends Event {
	constructor() {
		super({
			name: Events.GuildScheduledEventUserAdd,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {guildScheduledEvent} guildEvent The guild event the user joined
	 * @param {User} user The user who joined the event
	 * @readonly
	*/
	async run(client: EgglordClient, guildEvent: GuildScheduledEvent, user: User) {
		// Ignore the event if the user that joined was the creator of the event
		if (user.id == guildEvent.creatorId) return;

		// For debugging
		client.logger.debug(`User: ${user.displayName} has joined event: ${guildEvent.name} in guild: ${guildEvent.guild?.id}.`);

		// Check if event guildEventCreate is for logging
		const moderationSettings = guildEvent.guild?.settings?.moderationSystem;
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;

		const embed = new EgglordEmbed(client, guildEvent.guild)
			.setDescription([
				`${user.displayName} joined event: [${guildEvent.name}](${guildEvent})`,
				'',
				`There are now ${guildEvent.userCount ?? 0} users subscribed to the event.`,
			].join('\n'))
			.setColor(Colors.Green)
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