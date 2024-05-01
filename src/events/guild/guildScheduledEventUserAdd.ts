import Event from 'src/structures/Event';
import { Events, GuildScheduledEvent, User } from 'discord.js';
import EgglordClient from 'src/base/Egglord';

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
		if (client.config.debug) client.logger.debug(`User: ${user.displayName} has joined event: ${guildEvent.name} in guild: ${guildEvent.guild.id}.`);

		// Get server settings / if no settings then return
		const settings = guildEvent.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildEventCreate is for logging
		if (settings.ModLogEvents?.includes('EVENTUSERADD') && settings.ModLog) {
			const embed = new Embed(client, guildEvent.guild)
				.setDescription([
					`${user.displayName} joined event: [${guildEvent.name}](${guildEvent})`,
					'',
					`There are now ${guildEvent.userCount ?? 0} users subscribed to the event.`,
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