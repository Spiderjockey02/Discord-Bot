import Event from 'src/structures/Event';
import { Collection, Events, Snowflake, Message, GuildTextBasedChannel } from 'discord.js';
import EgglordClient from 'src/base/Egglord';

/**
 * Message delete bulk event
 * @event Egglord#MessageDeleteBulk
 * @extends {Event}
*/
export default class MessageDeleteBulk extends Event {
	constructor() {
		super({
			name: Events.MessageBulkDelete,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Collection<Snowflake, Message>} message The deleted message
	 * @readonly
	*/
	async run(client: EgglordClient, messages: Collection<Snowflake, Message>, channel: GuildTextBasedChannel) {
		// For debugging
		if (client.config.debug) client.logger.debug(`${messages.size} messages have been deleted in channel: ${channel.id}`);

		// Get server settings / if no settings then return
		const settings = channel.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event messageDeleteBulk is for logging
		if (settings.ModLogEvents?.includes('MESSAGEDELETEBULK') && settings.ModLog) {
			// Create file of deleted messages
			let humanLog = `**Deleted Messages from #${channel.name} (${channel.id}) in ${channel.guild.name} (${channel.guild.id})**`;

			for (const message of [...messages.values()].reverse()) {
				humanLog += `\r\n\r\n[${dateFormat(message.createdAt, 'ddd dd/mm/yyyy HH:MM:ss')}] ${message.author?.displayName ?? 'Unknown'} (${message.id})`;
				humanLog += ' : ' + message.content;
			}

			const attachment = new AttachmentBuilder(Buffer.from(humanLog, 'utf-8'), { name: 'DeletedMessages.txt' });
			// Get modlog channel
			const modChannel = channel.guild.channels.cache.get(settings.ModLogChannel);
			if (modChannel) {
				const msg = await modChannel.send({ files: [attachment] });

				// embed
				const embed = new Embed(client, channel.guild.id)
					.setDescription(`**Bulk deleted messages in ${messages.first().channel.toString()}**`)
					.setColor(15158332)
					.setFooter({ text: `Channel: ${messages.first().channel.id}` })
					.setAuthor({ name: messages.first().channel.name, iconURL: messages.first().guild.iconURL() })
					.addFields(
						{ name: 'Message count:', value: `${messages.size}`, inline: true },
						{ name: 'Deleted Messages:', value: `[view](https://txt.discord.website/?txt=${modChannel.id}/${msg.attachments.first().id}/DeletedMessages)`, inline: true },
					)
					.setTimestamp();

				client.addEmbed(modChannel.id, [embed]);
			}
		}
	}
}