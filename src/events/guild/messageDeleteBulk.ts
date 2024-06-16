import { Event, EgglordEmbed } from '../../structures';
import { Collection, Events, Snowflake, Message, GuildTextBasedChannel, BaseGuildTextChannel, AttachmentBuilder, Colors } from 'discord.js';
import EgglordClient from '../../base/Egglord';

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
		client.logger.debug(`${messages.size} messages have been deleted in channel: ${channel.id}`);

		// Check if event messageDeleteBulk is for logging
		const moderationSettings = channel.guild?.settings?.moderationSystem;
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;

		// Create file of deleted messages
		let humanLog = `**Deleted Messages from #${channel.name} (${channel.id}) in ${channel.guild.name} (${channel.guild.id})**`;

		for (const message of [...messages.values()].reverse()) {
			humanLog += `\r\n\r\n[${message.createdAt}] ${message.author?.displayName ?? 'Unknown'} (${message.id})`;
			humanLog += ' : ' + message.content;
		}

		const attachment = new AttachmentBuilder(Buffer.from(humanLog, 'utf-8'), { name: 'DeletedMessages.txt' });
		// Get modlog channel

		if (moderationSettings.loggingChannelId == null) return;
		const modChannel = await channel.guild.channels.fetch(moderationSettings.loggingChannelId) as BaseGuildTextChannel;
		if (modChannel) {
			const msg = await modChannel.send({ files: [attachment] });

			// embed
			const embed = new EgglordEmbed(client, channel.guild)
				.setDescription(`**Bulk deleted messages in ${channel.toString()}**`)
				.setColor(Colors.Red)
				.setFooter({ text: `Channel: ${channel.id}` })
				.setAuthor({ name: channel.name, iconURL: channel.guild.iconURL() ?? undefined })
				.addFields(
					{ name: 'Message count:', value: `${messages.size}`, inline: true },
					{ name: 'Deleted Messages:', value: `[view](https://txt.discord.website/?txt=${modChannel.id}/${msg.attachments.first()?.id}/DeletedMessages)`, inline: true },
				)
				.setTimestamp();

			client.webhookManger.addEmbed(modChannel.id, [embed]);
		}
	}
}