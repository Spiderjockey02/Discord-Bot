import EgglordClient from 'src/base/Egglord';
import { Event } from '../../structures';
import { EgglordEmbed } from '../../utils';
import { TextChannel } from 'discord.js';

export default class TicketClose extends Event {
	constructor() {
		super({
			name: 'ticketClose',
			dirname: __dirname,
		});
	}

	async run(client: EgglordClient, channel: TextChannel) {
	// Check if event AutoModerationRuleCreate is for logging
		const moderationSettings = channel.guild.settings?.moderationSystem;
		if (moderationSettings && moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) {

			const embed = new EgglordEmbed(client, channel.guild)
				.setTitle('ticket/ticket-close:TITLE')
				.setColor(15158332)
				.addFields(
					{ name: channel.guild.translate('ticket/ticket-close:TICKET'), value: channel.toString() },
					{ name: channel.guild.translate('ticket/ticket-close:USER'), value: `${client.users.cache.get(channel.name.split('-')[1])}` },
				)
				.setTimestamp();


			try {
				if (moderationSettings.loggingChannelId == null) return;
				const modChannel = await channel.guild.channels.fetch(moderationSettings.loggingChannelId);
				if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}