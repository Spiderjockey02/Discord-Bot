import { Event } from '../../structures';
import { Events, GuildChannel } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { EgglordEmbed } from '../../utils';

/**
 * Channel create event
 * @event Egglord#ChannelCreate
 * @extends {Event}
*/
export default class ChannelCreate extends Event {
	constructor() {
		super({
			name: Events.ChannelCreate,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {GuildChannel} channel The channel that was created
	 * @readonly
	*/
	async run(client: EgglordClient, channel: GuildChannel) {
		const { type, guild, name } = channel;
		// For debugging
		if (client.config.debug) client.logger.debug(`Channel: ${name} has been created in guild: ${guild.id}. (${type})`);

		// Get server settings / if no settings then return
		const moderationSettings = guild.settings?.moderationSystem;

		// IF it's a ticket channel and TICKET logging is enabled then don't show CHANNELCREATE log
		const regEx = /ticket-\d{18}/g;
		if (regEx.test(name) && moderationSettings?.loggingEvents.find(l => l.name == this.conf.name)) return;

		// Check if event channelCreate is for logging
		if (moderationSettings && moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) {
			const embed = new EgglordEmbed(client, guild)
				.setDescription(`**${guild.translate(`events/channel:${type}`)} ${guild.translate('events/channel:CREATE', { CHANNEL: channel.toString() })}**`)
				.setColor(3066993)
				.setFooter({ text: guild.translate('misc:ID', { ID: channel.id }) })
				.setAuthor({ name: client.user.displayName, iconURL: client.user.displayAvatarURL() })
				.setTimestamp();

			// Find channel and send message
			try {
				if (moderationSettings.loggingChannelId == null) return;
				const modChannel = await guild.channels.fetch(moderationSettings.loggingChannelId);
				if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}
