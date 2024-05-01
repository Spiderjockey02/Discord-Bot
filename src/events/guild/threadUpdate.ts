import Event from 'src/structures/Event';
import { Collection, Events, Snowflake, ThreadChannel, ThreadMember } from 'discord.js';
import EgglordClient from 'src/base/Egglord';

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
		if (client.config.debug) client.logger.debug(`Thread: ${newThread.name} has been updated in guild: ${newThread.guildId}. (${newThread.type.split('_')[1]})`);

		// Get server settings / if no settings then return
		const settings = newThread.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event channelCreate is for logging
		if (settings.ModLogEvents?.includes('THREADUPDATE') && settings.ModLog) {
			let embed, updated = false;

			// thread name change
			if (oldThread.name != newThread.name) {
				embed = new Embed(client, newThread.guild)
					.setDescription(`**Thread name changed of ${newThread.toString()}**`)
					.setColor(15105570)
					.setFooter({ text: `ID: ${newThread.id}` })
					.setAuthor({ name: newThread.guild.name, iconURL: newThread.guild.iconURL() })
					.addFields(
						{ name: 'Old:', value: `${oldThread.name}`, inline: true },
						{ name: 'New:', value: `${newThread.name}`, inline: true },
					)
					.setTimestamp();
				updated = true;
			}

			// thread archive state change
			if (oldThread.archived != newThread.archived) {
				embed = new Embed(client, newThread.guild)
					.setDescription(`**Thread archive state changed of ${newThread.toString()}**`)
					.setColor(15105570)
					.setFooter({ text: `ID: ${newThread.id}` })
					.setAuthor({ name: newThread.guild.name, iconURL: newThread.guild.iconURL() })
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
					const modChannel = await client.channels.fetch(settings.ModLogChannel).catch(() => client.logger.error(`Error fetching guild: ${newThread.guild.id} logging channel`));
					if (modChannel && modChannel.guild.id == newThread.guild.id) client.addEmbed(modChannel.id, [embed]);
				} catch (err: any) {
					client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}
	}
}
