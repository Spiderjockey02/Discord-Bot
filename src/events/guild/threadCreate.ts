import Event from 'src/structures/Event';
import { Events, ThreadChannel } from 'discord.js';
import EgglordClient from 'src/base/Egglord';

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
		if (client.config.debug) client.logger.debug(`Thread: ${thread.name} has been created in guild: ${thread.guildId}. (${thread.type.split('_')[1]})`);

		// The client should try and join the thread for auto-mod and command usage
		try {
			await thread.join();
		} catch (err: any) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		// Get server settings / if no settings then return
		const settings = thread.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event channelCreate is for logging
		if (settings.ModLogEvents?.includes('THREADCREATE') && settings.ModLog) {
			const embed = new Embed(client, thread.guild)
				.setDescription([
					`**${thread.type.split('_')[1].toLowerCase()} thread created: ${thread.toString()}**`,
					'',
					`Owner: ${client.users.cache.get(thread.ownerId)?.displayName}`,
				].join('\n'))
				.setColor(3066993)
				.setFooter({ text: thread.guild.translate('misc:ID', { ID: thread.id }) })
				.setAuthor({ name: client.user.displayName, iconURL: client.user.displayAvatarURL() })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await client.channels.fetch(settings.ModLogChannel).catch(() => client.logger.error(`Error fetching guild: ${thread.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == thread.guild.id) client.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}
