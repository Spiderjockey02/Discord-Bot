import { Event, EgglordEmbed } from '../../structures';
import { Colors, Events, GuildChannel } from 'discord.js';
import EgglordClient from '../../base/Egglord';

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
		client.logger.debug(`Channel: ${name} has been created in guild: ${guild.id}. (${type})`);

		// Get server settings / if no settings then return
		const moderationSettings = guild.settings?.moderationSystem;

		// IF it's a ticket channel and TICKET logging is enabled then don't show CHANNELCREATE log
		const regEx = /ticket-\d{18}/g;
		if (regEx.test(name)) return;

		// Check if event channelCreate is for logging
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;

		const embed = new EgglordEmbed(client, guild)
			.setDescription(`**${client.languageManager.translate(guild, `events/channel:${type}`)} ${client.languageManager.translate(guild, 'events/channel:CREATE', { CHANNEL: `${channel}` })}**`)
			.setColor(Colors.Green)
			.setFooter({ text: client.languageManager.translate(guild, 'misc:ID', { ID: channel.id }) })
			.setAuthor({ name: client.user.displayName, iconURL: client.user.displayAvatarURL() })
			.setTimestamp();

		// Find channel and send message
		try {
			if (moderationSettings.loggingChannelId == null) return;
			const modChannel = await guild.channels.fetch(moderationSettings.loggingChannelId);
			if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
		} catch (err) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
		}
	}
}
