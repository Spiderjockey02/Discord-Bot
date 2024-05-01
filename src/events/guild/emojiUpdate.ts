import Event from 'src/structures/Event';
import { Events, GuildEmoji } from 'discord.js';
import EgglordClient from 'src/base/Egglord';

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
		if (client.config.debug) client.logger.debug(`Emoji: ${newEmoji.name} has been updated in guild: ${newEmoji.guild.id}.`);

		// Get server settings / if no settings then return
		const settings = newEmoji.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event emojiUpdate is for logging
		if (settings.ModLogEvents?.includes('EMOJIUPDATE') && settings.ModLog) {
			let embed, updated = false;

			// emoji name change
			if (oldEmoji.name != newEmoji.name) {
				embed = new Embed(client, newEmoji.guild)
					.setDescription('**Emoji name update**')
					.setColor(15105570)
					.setFooter({ text: `ID: ${newEmoji.id}` })
					.setAuthor({ name: newEmoji.guild.name, iconURL: newEmoji.guild.iconURL() })
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
					embed = new Embed(client, newEmoji.guild)
						.setDescription('**Emoji roles updated**')
						.setColor(15105570)
						.setFooter({ text: `ID: ${newEmoji.id}` })
						.setAuthor({ name: newEmoji.guild.name, iconURL: newEmoji.guild.iconURL() })
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
					const modChannel = await client.channels.fetch(settings.ModLogChannel).catch(() => client.logger.error(`Error fetching guild: ${newEmoji.guild.id} logging channel`));
					if (modChannel && modChannel.guild.id == newEmoji.guild.id) client.webhookManger.addEmbed(modChannel.id, [embed]);
				} catch (err: any) {
					client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}
	}
}

module.exports = EmojiUpdate;
