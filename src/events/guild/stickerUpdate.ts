import { Events, Sticker } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { Event } from '../../structures';
import { EgglordEmbed } from '../../utils';

/**
 * Sticker update event
 * @event Egglord#StickerUpdate
 * @extends {Event}
*/
export default class StickerUpdate extends Event {
	constructor() {
		super({
			name: Events.GuildStickerUpdate,
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

		// Check if event channelCreate is for logging
		const moderationSettings = newSticker.guild?.settings?.moderationSystem;
		if (moderationSettings && moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) {
			let embed, updated = false;

			// sticker name change
			if (oldSticker.name != newSticker.name) {
				embed = new EgglordEmbed(client, newSticker.guild)
					.setDescription(`Sticker name changed of ${newSticker.name}**`)
					.setColor(15105570)
					.setFooter({ text: `ID: ${newSticker.id}` })
					.setAuthor({ name: newSticker.guild.name, iconURL: newSticker.guild.iconURL() ?? undefined })
					.addFields(
						{ name: 'Old:', value: `${oldSticker.name}`, inline: true },
						{ name: 'New:', value: `${newSticker.name}`, inline: true },
					)
					.setTimestamp();
				updated = true;
			}

			// sticker description change
			if (oldSticker.description != newSticker.description) {
				embed = new EgglordEmbed(client, newSticker.guild)
					.setDescription(`Sticker description changed of ${newSticker.name}**`)
					.setColor(15105570)
					.setFooter({ text: `ID: ${newSticker.id}` })
					.setAuthor({ name: newSticker.guild.name, iconURL: newSticker.guild.iconURL() ?? undefined })
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
					if (moderationSettings.loggingChannelId == null || embed == undefined) return;
					const modChannel = await newSticker.guild.channels.fetch(moderationSettings.loggingChannelId);
					if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
				} catch (err: any) {
					client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}
	}
}

