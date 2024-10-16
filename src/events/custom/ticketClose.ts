import EgglordClient from '../../base/Egglord';
import { Event, EgglordEmbed } from '../../structures';
import { AttachmentBuilder, Colors, TextChannel } from 'discord.js';

export default class TicketClose extends Event {
	constructor() {
		super({
			name: 'ticketClose',
			dirname: __dirname,
		});
	}

	async run(client: EgglordClient, channel: TextChannel, transcript?: AttachmentBuilder) {
		client.logger.debug(`Ticket: ${channel.name} has been closed in guild: ${channel.guild.id}.`);

		// Check if event ticketClose is for logging
		const moderationSettings = channel.guild.settings?.moderationSystem;
		if (moderationSettings && moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) {

			const embed = new EgglordEmbed(client, channel.guild)
				.setTitle('ticket/ticket-close:TITLE')
				.setColor(Colors.Red)
				.addFields(
					{ name: client.languageManager.translate(channel.guild, 'ticket/ticket-close:TICKET'), value: `${channel}` },
					{ name: client.languageManager.translate(channel.guild, 'ticket/ticket-close:USER'), value: `${client.users.cache.get(channel.name.split('-')[1])}` },
				)
				.setTimestamp();

			try {
				if (moderationSettings.loggingChannelId == null) return;
				const modChannel = await channel.guild.channels.fetch(moderationSettings.loggingChannelId);
				if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed, transcript]);
			} catch (err) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
			}
		}
	}
}