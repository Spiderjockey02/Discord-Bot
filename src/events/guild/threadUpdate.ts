import { Event, EgglordEmbed } from '../../structures';
import { APIEmbed, Colors, Events, Guild, JSONEncodable, ThreadChannel } from 'discord.js';
import EgglordClient from '../../base/Egglord';

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
		client.logger.debug(`Thread: ${newThread.name} has been updated in guild: ${newThread.guildId}. (${newThread.type})`);

		// Check if event channelCreate is for logging
		const moderationSettings = newThread.guild?.settings?.moderationSystem;
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;

		// thread name change
		if (oldThread.name != newThread.name) {
			const embed = new EgglordEmbed(client, newThread.guild)
				.setDescription(client.languageManager.translate(newThread.guild, 'events/threads:NAME_DESC', { NAME: `${newThread}` }))
				.setColor(Colors.Orange)
				.setFooter({ text: client.languageManager.translate(newThread.guild, 'misc:ID', { ID: newThread.id }) })
				.setAuthor({ name: newThread.guild.name, iconURL: newThread.guild.iconURL() ?? undefined })
				.addFields(
					{ name: client.languageManager.translate(newThread.guild, 'misc:OLD'), value: `${oldThread.name}`, inline: true },
					{ name: client.languageManager.translate(newThread.guild, 'misc:NEW'), value: `${newThread.name}`, inline: true },
				)
				.setTimestamp();
			this.sendEmbed(client, newThread.guild, embed, moderationSettings.loggingChannelId);
		}

		// thread archive state change
		if (oldThread.archived != newThread.archived) {
			const embed = new EgglordEmbed(client, newThread.guild)
				.setDescription(client.languageManager.translate(newThread.guild, 'events/threads:ARCHIVE_DESC', { NAME: `${newThread}` }))
				.setColor(Colors.Orange)
				.setFooter({ text: client.languageManager.translate(newThread.guild, 'misc:ID', { ID: newThread.id }) })
				.setAuthor({ name: newThread.guild.name, iconURL: newThread.guild.iconURL() ?? undefined })
				.addFields(
					{ name: client.languageManager.translate(newThread.guild, 'misc:OLD'), value: `${oldThread.archived}`, inline: true },
					{ name: client.languageManager.translate(newThread.guild, 'misc:NEW'), value: `${newThread.archived}`, inline: true },
				)
				.setTimestamp();
			this.sendEmbed(client, newThread.guild, embed, moderationSettings.loggingChannelId);
		}
	}

	async sendEmbed(client: EgglordClient, guild: Guild, embed: JSONEncodable<APIEmbed>, loggingChannelId: string | null) {
		// Find channel and send message
		try {
			if (loggingChannelId == null || embed == undefined) return;
			const modChannel = await guild.channels.fetch(loggingChannelId);
			if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
		} catch (err) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
		}
	}
}
