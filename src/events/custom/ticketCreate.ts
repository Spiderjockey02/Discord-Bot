import { Event } from '../../structures';
import { TextChannel, User } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { EgglordEmbed } from '../../utils';

export default class TicketCreate extends Event {
	constructor() {
		super({
			name: 'ticketCreate',
			dirname: __dirname,
		});
	}

	async run(client: EgglordClient, channel: TextChannel, user: User, reason?: string) {
		client.logger.debug(`Ticket: ${channel.name} has been created in guild: ${channel.guildId}.`);

		// Check if event AutoModerationRuleCreate is for logging
		const moderationSettings = channel.guild.settings?.moderationSystem;
		if (moderationSettings && moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) {

			const embed = new EgglordEmbed(client, channel.guild)
				.setTitle('ticket/ticket-create:LOG_TITLE')
				.setColor(3066993)
				.addFields(
					{ name: channel.guild.translate('ticket/ticket-create:TICKET'), value: channel.toString() },
					{ name: channel.guild.translate('ticket/ticket-create:USER'), value: `${user}`, inline: true },
					{ name: channel.guild.translate('ticket/ticket-create:FIELD2'), value: `${reason}`, inline: true },
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