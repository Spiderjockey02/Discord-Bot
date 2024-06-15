import { Event, EgglordEmbed } from '../../structures';
import { Colors, Events, GuildEmoji } from 'discord.js';
import EgglordClient from '../../base/Egglord';

/**
 * Emoji delete event
 * @event Egglord#EmojiDelete
 * @extends {Event}
*/
export default class EmojiDelete extends Event {
	constructor() {
		super({
			name: Events.GuildEmojiDelete,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {GuildEmoji} emoji The emoji that was deleted
	 * @readonly
	*/
	async run(client: EgglordClient, emoji: GuildEmoji) {
		// For debugging
		client.logger.debug(`Emoji: ${emoji.name} has been deleted in guild: ${emoji.guild.id}.`);

		// Check if event emojiDelete is for logging
		const moderationSettings = emoji.guild.settings?.moderationSystem;
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;

		const embed = new EgglordEmbed(client, emoji.guild)
			.setDescription(client.languageManager.translate(emoji.guild, 'events/emoji:DELETE_TITLE', { EMOJI: `${emoji}`, NAME: emoji.name }))
			.setColor(Colors.Red)
			.setFooter({ text: client.languageManager.translate(emoji.guild, 'misc:ID', { ID: emoji.id }) })
			.setAuthor({ name: emoji.guild.name, iconURL: emoji.guild.iconURL() ?? undefined })
			.setTimestamp();

		// Find channel and send message
		try {
			if (moderationSettings.loggingChannelId == null) return;
			const modChannel = await emoji.guild.channels.fetch(moderationSettings.loggingChannelId);
			if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
		} catch (err) {
			client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
		}
	}
}
