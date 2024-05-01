import { Events, Sticker } from 'discord.js';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';

/**
 * Sticker create event
 * @event Egglord#StickerCreate
 * @extends {Event}
*/
export default class StickerCreate extends Event {
	constructor() {
		super({
			name: Events.GuildStickerCreate,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Sticker} sticker The sticker that was created
	 * @readonly
	*/
	async run(client: EgglordClient, sticker: Sticker) {
		// For debugging
		if (client.config.debug) client.logger.debug(`Sticker: ${sticker.name} has been created in guild: ${sticker.guildId}. (${sticker.type})`);

		// fetch the user who made the sticker
		let user;
		try {
			user = await sticker.fetchUser();
		} catch (err: any) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		// Get server settings / if no settings then return
		const settings = sticker.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event channelCreate is for logging
		if (settings.ModLogEvents?.includes('STICKERCREATE') && settings.ModLog) {
			const embed = new Embed(client, sticker.guild)
				.setDescription([
					`**Sticker created: ${sticker.name}**`, `${user ? ['', `Created by: ${user?.displayName}`].join('\n') : []}`,
				].join('\n'))
				.setColor(3066993)
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
