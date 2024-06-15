import { Event, EgglordEmbed } from '../../structures';
import { Colors, Events, GuildEmoji } from 'discord.js';
import EgglordClient from '../../base/Egglord';

/**
 * Emoji update event
 * @event Egglord#EmojiUpdate
 * @extends {Event}
*/
export default class EmojiUpdate extends Event {
	constructor() {
		super({
			name: Events.GuildEmojiUpdate,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {GuildEmoji} oldEmoji The emoji before the update
	 * @param {GuildEmoji} newEmoji The emoji after the update
	 * @readonly
	*/
	async run(client: EgglordClient, oldEmoji: GuildEmoji, newEmoji: GuildEmoji) {
		// For debugging
		client.logger.debug(`Emoji: ${newEmoji.name} has been updated in guild: ${newEmoji.guild.id}.`);

		// Check if event emojiUpdate is for logging
		const moderationSettings = newEmoji.guild.settings?.moderationSystem;
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;
		let embed, updated = false;

		// emoji name change
		if (oldEmoji.name != newEmoji.name) {
			embed = new EgglordEmbed(client, newEmoji.guild)
				.setDescription('**Emoji name update**')
				.setColor(Colors.Orange)
				.setFooter({ text: `ID: ${newEmoji.id}` })
				.setAuthor({ name: newEmoji.guild.name, iconURL: newEmoji.guild.iconURL() ?? undefined })
				.addFields(
					{ name: 'Old:', value: `${oldEmoji.name}`, inline: true },
					{ name: 'New:', value: `${newEmoji.name}`, inline: true },
				)
				.setTimestamp();
			updated = true;
		}

		// emoji role update
		if (oldEmoji.roles.cache.size != newEmoji.roles.cache.size) {
			const rolesAdded = newEmoji.roles.cache.filter(x => !oldEmoji.roles.cache.get(x.id));
			const rolesRemoved = oldEmoji.roles.cache.filter(x => !newEmoji.roles.cache.get(x.id));
			if (rolesAdded.size != 0 || rolesRemoved.size != 0) {
				const roleAddedString = [];
				for (const role of [...rolesAdded.values()]) {
					roleAddedString.push(role.toString());
				}
				const roleRemovedString = [];
				for (const role of [...rolesRemoved.values()]) {
					roleRemovedString.push(role.toString());
				}
				embed = new EgglordEmbed(client, newEmoji.guild)
					.setDescription('**Emoji roles updated**')
					.setColor(Colors.Orange)
					.setFooter({ text: `ID: ${newEmoji.id}` })
					.setAuthor({ name: newEmoji.guild.name, iconURL: newEmoji.guild.iconURL() ?? undefined })
					.addFields(
						{ name: `Added roles [${rolesAdded.size}]:`, value: `${roleAddedString.length == 0 ? '*None*' : roleAddedString.join('\n ')}`, inline: true },
						{ name: `Removed roles [${rolesRemoved.size}]:`, value: `${roleRemovedString.length == 0 ? '*None*' : roleRemovedString.join('\n ')}`, inline: true })
					.setTimestamp();
				updated = true;
			}
		}

		if (updated) {
			// Find channel and send message
			try {
				if (moderationSettings.loggingChannelId == null || embed == undefined) return;
				const modChannel = await newEmoji.guild.channels.fetch(moderationSettings.loggingChannelId);
				if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
			}
		}

	}
}