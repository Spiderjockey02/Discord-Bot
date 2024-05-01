import Event from 'src/structures/Event';
import { Events, Sticker } from 'discord.js';
import EgglordClient from 'src/base/Egglord';

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
		if (client.config.debug) client.logger.debug(`Sticker: ${sticker.name} has been deleted in guild: ${sticker.guildId}. (${sticker.type})`);

		// Get server settings / if no settings then return
		const settings = sticker.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event channelCreate is for logging
		if (settings.ModLogEvents?.includes('STICKERDELETE') && settings.ModLog) {
			const embed = new Embed(client, sticker.guild)
				.setDescription(`**Sticker deleted: ${sticker.name}**`)
				.setColor(15158332)
				.setImage(`https://cdn.discordapp.com/stickers/${sticker.id}.png`)
				.setFooter({ text: sticker.guild.translate('misc:ID', { ID: sticker.id }) })
				.setAuthor({ name: client.user.displayName, iconURL: client.user.displayAvatarURL() })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await client.channels.fetch(settings.ModLogChannel).catch(() => client.logger.error(`Error fetching guild: ${sticker.guildId} logging channel`));
				if (modChannel && modChannel.guild.id == sticker.guildId) client.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}

module.exports = StickerDelete;
