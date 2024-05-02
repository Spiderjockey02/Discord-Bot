import { Event } from '../../structures';
import { Events, ThreadChannel } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { EgglordEmbed } from '../../utils';

/**
 * Thread update event
 * @event Egglord#ThreadUpdate
 * @extends {Event}
*/
export default class ThreadUpdate extends Event {
	constructor() {
		super({
			name: Events.ThreadUpdate,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {ThreadChannel} oldThread The thread before the update
	 * @param {ThreadChannel} newThread The thread after the update
	 * @readonly
	*/
	async run(client: EgglordClient, oldThread: ThreadChannel, newThread: ThreadChannel) {
		// For debugging
		if (client.config.debug) client.logger.debug(`Thread: ${newThread.name} has been updated in guild: ${newThread.guildId}. (${newThread.type})`);

		// Check if event channelCreate is for logging
		const moderationSettings = newThread.guild?.settings?.moderationSystem;
		if (moderationSettings && moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) {
			let embed, updated = false;

			// thread name change
			if (oldThread.name != newThread.name) {
				embed = new EgglordEmbed(client, newThread.guild)
					.setDescription(`**Thread name changed of ${newThread.toString()}**`)
					.setColor(15105570)
					.setFooter({ text: `ID: ${newThread.id}` })
					.setAuthor({ name: newThread.guild.name, iconURL: newThread.guild.iconURL() ?? undefined })
					.addFields(
						{ name: 'Old:', value: `${oldThread.name}`, inline: true },
						{ name: 'New:', value: `${newThread.name}`, inline: true },
					)
					.setTimestamp();
				updated = true;
			}

			// thread archive state change
			if (oldThread.archived != newThread.archived) {
				embed = new EgglordEmbed(client, newThread.guild)
					.setDescription(`**Thread archive state changed of ${newThread.toString()}**`)
					.setColor(15105570)
					.setFooter({ text: `ID: ${newThread.id}` })
					.setAuthor({ name: newThread.guild.name, iconURL: newThread.guild.iconURL() ?? undefined })
					.addFields(
						{ name: 'Old:', value: `${oldThread.archived}`, inline: true },
						{ name: 'New:', value: `${newThread.archived}`, inline: true },
					)
					.setTimestamp();
				updated = true;
			}

			// Find channel and send message
			if (updated) {
				try {
					if (moderationSettings.loggingChannelId == null || embed == undefined) return;
					const modChannel = await newThread.guild.channels.fetch(moderationSettings.loggingChannelId);
					if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
				} catch (err: any) {
					client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}
	}
}
