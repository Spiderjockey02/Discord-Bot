import { Event, EgglordEmbed } from '../../structures';
import { Colors, Events, Sticker } from 'discord.js';
import EgglordClient from '../../base/Egglord';

/**
 * Sticker delete event
 * @event Egglord#StickerDelete
 * @extends {Event}
*/
export default class StickerDelete extends Event {
	constructor() {
		super({
			name: Events.GuildStickerDelete,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Sticker} sticker The sticker that was deleted
	 * @readonly
	*/
	async run(client: EgglordClient, sticker: Sticker) {
		// For debugging
		client.logger.debug(`Sticker: ${sticker.name} has been deleted in guild: ${sticker.guildId}. (${sticker.type})`);

		// Check if event channelCreate is for logging
		const moderationSettings = sticker.guild?.settings?.moderationSystem;
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;
		const embed = new EgglordEmbed(client, sticker.guild)
			.setDescription(client.languageManager.translate(sticker.guild, 'events/sticker:DELETE_DESC', { NAME: sticker.name }))
			.setColor(Colors.Red)
			.setImage(`https://cdn.discordapp.com/stickers/${sticker.id}.png`)
			.setFooter({ text: client.languageManager.translate(sticker.guild, 'misc:ID', { ID: sticker.id }) })
			.setAuthor({ name: client.user.displayName, iconURL: client.user.displayAvatarURL() })
			.setTimestamp();

		// Find channel and send message
		try {
			if (moderationSettings.loggingChannelId == null) return;
			const modChannel = await sticker.guild.channels.fetch(moderationSettings.loggingChannelId);
			if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
		} catch (err) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
		}
	}
}