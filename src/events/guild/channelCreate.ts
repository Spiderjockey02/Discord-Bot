import Event from 'src/structures/Event';
import { Events, GuildChannel } from 'discord.js';
import EgglordClient from 'src/base/Egglord';

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
		const settings = guild.settings;
		if (Object.keys(settings).length == 0) return;

		// IF it's a ticket channel and TICKET logging is enabled then don't show CHANNELCREATE log
		const regEx = /ticket-\d{18}/g;
		if (regEx.test(name) && settings.ModLogEvents?.includes('TICKET')) return;

		// Check if event channelCreate is for logging
		if (settings.ModLogEvents?.includes('CHANNELCREATE') && settings.ModLog) {
			const embed = new Embed(client, guild)
				.setDescription(`**${guild.translate(`events/channel:${type}`)} ${guild.translate('events/channel:CREATE', { CHANNEL: channel.toString() })}**`)
				.setColor(3066993)
				.setFooter({ text: guild.translate('misc:ID', { ID: channel.id }) })
				.setAuthor({ name: client.user.displayName, iconURL: client.user.displayAvatarURL() })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await client.channels.fetch(settings.ModLogChannel).catch(() => client.logger.error(`Error fetching guild: ${channel.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == guild.id) client.webhookManger.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}
