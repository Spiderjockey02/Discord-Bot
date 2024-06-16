import { Event, EgglordEmbed } from '../../structures';
import { Colors, Events, ThreadChannel } from 'discord.js';
import EgglordClient from '../../base/Egglord';

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
		client.logger.debug(`Thread: ${thread.name} has been created in guild: ${thread.guildId}. (${thread.type})`);

		// The client should try and join the thread for auto-mod and command usage
		try {
			await thread.join();
		} catch (err) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
		}

		// Check if event channelCreate is for logging
		const moderationSettings = thread.guild?.settings?.moderationSystem;
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;

		const creator = client.users.cache.get(thread.ownerId ?? '');
		const embed = new EgglordEmbed(client, thread.guild)
			.setDescription(
				client.languageManager.translate(thread.guild, 'events/threads:CREATE_DESC', { TYPE: thread.type, NAME: `${thread}`, USERNAME: `${creator?.displayName}` }),
			)
			.setColor(Colors.Green)
			.setFooter({ text: client.languageManager.translate(thread.guild, 'misc:ID', { ID: thread.id }) })
			.setAuthor({ name: client.user.displayName, iconURL: client.user.displayAvatarURL() })
			.setTimestamp();

		// Find channel and send message
		try {
			if (moderationSettings.loggingChannelId == null) return;
			const modChannel = await thread.guild.channels.fetch(moderationSettings.loggingChannelId);
			if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
		} catch (err) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
		}
	}
}
