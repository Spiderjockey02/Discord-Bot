import { Sticker } from 'discord.js';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';

/**
 * Sticker update event
 * @event Egglord#StickerUpdate
 * @extends {Event}
*/
export default class StickerUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Sticker} oldSticker The sticker before the update
	 * @param {Sticker} newSticker The sticker after the update
	 * @readonly
	*/
	async run(client: EgglordClient, oldSticker: Sticker, newSticker: Sticker) {
		// For debugging
		if (client.config.debug) client.logger.debug(`Sticker: ${newSticker.name} has been updated in guild: ${newSticker.guildId}. (${newSticker.type})`);

		// Get server settings / if no settings then return
		const settings = newSticker.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event channelCreate is for logging
		if (settings.ModLogEvents?.includes('STICKERUPDATE') && settings.ModLog) {
			let embed, updated = false;

			// sticker name change
			if (oldSticker.name != newSticker.name) {
				embed = new Embed(client, newSticker.guild)
					.setDescription(`Sticker name changed of ${newSticker.name}**`)
					.setColor(15105570)
					.setFooter({ text: `ID: ${newSticker.id}` })
					.setAuthor({ name: newSticker.guild.name, iconURL: newSticker.guild.iconURL() })
					.addFields(
						{ name: 'Old:', value: `${oldSticker.name}`, inline: true },
						{ name: 'New:', value: `${newSticker.name}`, inline: true },
					)
					.setTimestamp();
				updated = true;
			}

			// sticker description change
			if (oldSticker.description != newSticker.description) {
				embed = new Embed(client, newSticker.guild)
					.setDescription(`Sticker description changed of ${newSticker.name}**`)
					.setColor(15105570)
					.setFooter({ text: `ID: ${newSticker.id}` })
					.setAuthor({ name: newSticker.guild.name, iconURL: newSticker.guild.iconURL() })
					.addFields(
						{ name: 'Old:', value: `${oldSticker.description}`, inline: true },
						{ name: 'New:', value: `${newSticker.description}`, inline: true },
					)
					.setTimestamp();
				updated = true;
			}

			// Find channel and send message
			if (updated) {
				try {
					const modChannel = await client.channels.fetch(settings.ModLogChannel).catch(() => client.logger.error(`Error fetching guild: ${newSticker.guildId} logging channel`));
					if (modChannel && modChannel.guild.id == newSticker.guildId) client.addEmbed(modChannel.id, [embed]);
				} catch (err: any) {
					client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}
	}
}

