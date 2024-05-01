import { ChannelType, DMChannel, Events, GuildChannel } from 'discord.js';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';

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
		if (client.config.debug) client.logger.debug(`Channel: ${channel.type == ChannelType.DM ? channel.recipient?.displayName : channel.name} has been deleted${channel.type == ChannelType.DM ? '' : ` in guild: ${channel.guild.id}`}. (${ChannelType[channel.type]})`);

		// Don't really know but a check for DM must be made
		if (channel.type == ChannelType.DM) return;

		// Get server settings / if no settings then return
		const settings = channel.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// IF it's a ticket channel and TICKET logging is enabled then don't show CHANNELDELETE log
		const regEx = /ticket-\d{18}/g;
		if (regEx.test(channel.name) && settings.ModLogEvents?.includes('TICKET')) return client.emit('ticketClose', channel);

		// Check if event channelDelete is for logging
		if (settings.ModLogEvents?.includes('CHANNELDELETE') && settings.ModLog) {
			const embed = new Embed(client, channel.guild)
				.setDescription(`**${ChannelType[channel.type]} channel deleted: ${'#' + channel.name}**`)
				.setColor(15158332)
				.setFooter({ text: `ID: ${channel.id}` })
				.setAuthor({ name: client.user.displayName, iconURL: client.user.displayAvatarURL() })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await client.channels.fetch(settings.ModLogChannel).catch(() => client.logger.error(`Error fetching guild: ${channel.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == channel.guild.id) client.webhookManger.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}