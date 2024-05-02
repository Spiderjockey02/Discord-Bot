import { Event } from '../../structures';
import { Events, ThreadChannel } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { EgglordEmbed } from '../../utils';

/**
 * Thread create event
 * @event Egglord#ThreadCreate
 * @extends {Event}
*/
export default class ThreadCreate extends Event {
	constructor() {
		super({
			name: Events.ThreadCreate,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {ThreadChannel} thread The thread that was created
	 * @readonly
	*/
	async run(client: EgglordClient, thread: ThreadChannel) {
		// For debugging
		if (client.config.debug) client.logger.debug(`Thread: ${thread.name} has been created in guild: ${thread.guildId}. (${thread.type})`);

		// The client should try and join the thread for auto-mod and command usage
		try {
			await thread.join();
		} catch (err: any) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		// Check if event channelCreate is for logging
		const moderationSettings = thread.guild?.settings?.moderationSystem;
		if (moderationSettings && moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) {
			const embed = new EgglordEmbed(client, thread.guild)
				.setDescription([
					`**${thread.type} thread created: ${thread.toString()}**`,
					'',
					`Owner: ${client.users.cache.get(thread.ownerId ?? '')?.displayName}`,
				].join('\n'))
				.setColor(3066993)
				.setFooter({ text: thread.guild.translate('misc:ID', { ID: thread.id }) })
				.setAuthor({ name: client.user.displayName, iconURL: client.user.displayAvatarURL() })
				.setTimestamp();

			// Find channel and send message
			try {
				if (moderationSettings.loggingChannelId == null) return;
				const modChannel = await thread.guild.channels.fetch(moderationSettings.loggingChannelId);
				if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}
