import { ChannelType, Colors, DMChannel, Events, GuildChannel } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { Event, EgglordEmbed } from '../../structures';

/**
 * Channel delete event
 * @event Egglord#ChannelDelete
 * @extends {Event}
*/
export default class ChannelDelete extends Event {
	constructor() {
		super({
			name: Events.ChannelDelete,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {GuildChannel|DMChannel} channel The channel that was deleted
	 * @readonly
	*/
	async run(client: EgglordClient, channel: DMChannel | GuildChannel) {
		// For debugging
		client.logger.debug(`Channel: ${channel.type == ChannelType.DM ? channel.recipient?.displayName : channel.name} has been deleted${channel.type == ChannelType.DM ? '' : ` in guild: ${channel.guild.id}`}. (${ChannelType[channel.type]})`);

		// Don't really know but a check for DM must be made
		if (channel.type == ChannelType.DM) return;

		// Get server settings / if no settings then return
		const moderationSettings = channel.guild.settings?.moderationSystem;

		// IF it's a ticket channel and TICKET logging is enabled then don't show CHANNELDELETE log
		const regEx = /ticket-\d{18}/g;
		if (regEx.test(channel.name)) return;

		// Check if event channelDelete is for logging
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;

		const embed = new EgglordEmbed(client, channel.guild)
			.setDescription(client.languageManager.translate(channel.guild, 'events/channel:DELETE_TITLE', { TYPE: ChannelType[channel.type], NAME: channel.name }))
			.setColor(Colors.Red)
			.setFooter({ text: client.languageManager.translate(channel.guild, 'misc:ID', { ID: channel.id }) })
			.setAuthor({ name: client.user.displayName, iconURL: client.user.displayAvatarURL() })
			.setTimestamp();

		// Find channel and send message
		try {
			if (moderationSettings.loggingChannelId == null) return;
			const modChannel = await channel.guild.channels.fetch(moderationSettings.loggingChannelId);
			if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
		} catch (err) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
		}
	}
}