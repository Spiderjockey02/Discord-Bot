import { Colors, Events, Sticker } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { Event, EgglordEmbed } from '../../structures';

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
		client.logger.debug(`Sticker: ${sticker.name} has been created in guild: ${sticker.guildId}. (${sticker.type})`);

		// fetch the user who made the sticker
		let user;
		try {
			user = await sticker.fetchUser();
		} catch (err) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
		}

		// Check if event channelCreate is for logging
		const moderationSettings = sticker.guild?.settings?.moderationSystem;
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;

		const embed = new EgglordEmbed(client, sticker.guild)
			.setDescription(
				client.languageManager.translate(sticker.guild, 'events/sticker:CREATE_DESC', { NAME: sticker.name, USER: `${user}` }),
			)
			.setColor(Colors.Green)
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
