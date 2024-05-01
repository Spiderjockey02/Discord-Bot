import Event from 'src/structures/Event';
import { Events, GuildScheduledEvent, User } from 'discord.js';
import EgglordClient from 'src/base/Egglord';

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
		if (client.config.debug) client.logger.debug(`User: ${user.displayName} has left event: ${guildEvent.name} in guild: ${guildEvent.guild.id}.`);

		// Get server settings / if no settings then return
		const settings = guildEvent.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildEventCreate is for logging
		if (settings.ModLogEvents?.includes('EVENTUSERREMOVE') && settings.ModLog) {
			const embed = new Embed(client, guildEvent.guild)
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
				const modChannel = await client.channels.fetch(settings.ModLogChannel).catch(() => client.logger.error(`Error fetching guild: ${guildEvent.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == guildEvent.guild.id) client.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}
