import { APIEmbed, Colors, Events, Guild, JSONEncodable, Sticker } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { Event, EgglordEmbed } from '../../structures';

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
		client.logger.debug(`Sticker: ${newSticker.name} has been updated in guild: ${newSticker.guildId}. (${newSticker.type})`);

		// Check if event channelCreate is for logging
		const moderationSettings = newSticker.guild?.settings?.moderationSystem;
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;

		// sticker name change
		if (oldSticker.name != newSticker.name) {
			const embed = new EgglordEmbed(client, newSticker.guild)
				.setDescription(client.languageManager.translate(newSticker.guild, 'events/sticker:NAME_DESC', { NAME: newSticker.name }))
				.setColor(Colors.Orange)
				.setFooter({ text: client.languageManager.translate(newSticker.guild, 'misc:ID', { ID: newSticker.id }) })
				.setAuthor({ name: newSticker.guild.name, iconURL: newSticker.guild.iconURL() ?? undefined })
				.addFields(
					{ name: client.languageManager.translate(newSticker.guild, 'misc:OLD'), value: `${oldSticker.name}`, inline: true },
					{ name: client.languageManager.translate(newSticker.guild, 'misc:NEW'), value: `${newSticker.name}`, inline: true },
				)
				.setTimestamp();
			this.sendEmbed(client, newSticker.guild, embed, moderationSettings.loggingChannelId);
		}

		// sticker description change
		if (oldSticker.description != newSticker.description) {
			const embed = new EgglordEmbed(client, newSticker.guild)
				.setDescription(client.languageManager.translate(newSticker.guild, 'events/sticker:DESC_DESC', { NAME: newSticker.name }))
				.setColor(Colors.Orange)
				.setFooter({ text: client.languageManager.translate(newSticker.guild, 'misc:ID', { ID: newSticker.id }) })
				.setAuthor({ name: newSticker.guild.name, iconURL: newSticker.guild.iconURL() ?? undefined })
				.addFields(
					{ name: client.languageManager.translate(newSticker.guild, 'misc:OLD'), value: `${oldSticker.description}`, inline: true },
					{ name: client.languageManager.translate(newSticker.guild, 'misc:NEW'), value: `${newSticker.description}`, inline: true },
				)
				.setTimestamp();
			this.sendEmbed(client, newSticker.guild, embed, moderationSettings.loggingChannelId);
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

