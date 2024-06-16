import { Event, EgglordEmbed } from '../../structures';
import { Colors, Events, GuildEmoji } from 'discord.js';
import EgglordClient from '../../base/Egglord';

/**
 * Emoji create event
 * @event Egglord#EmojiCreate
 * @extends {Event}
*/
export default class EmojiCreate extends Event {
	constructor() {
		super({
			name: Events.GuildEmojiCreate,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {GuildEmoji} emoji The emoji that was created
	 * @readonly
	*/
	async run(client: EgglordClient, emoji: GuildEmoji) {
		// For debugging
		client.logger.debug(`Emoji: ${emoji.name} has been created in guild: ${emoji.guild.id}.`);

		// Check if event emojiCreate is for logging
		const moderationSettings = emoji.guild.settings?.moderationSystem;
		if (!moderationSettings || !moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) return;

		const embed = new EgglordEmbed(client, emoji.guild)
			.setDescription(client.languageManager.translate(emoji.guild, 'events/emoji:CREATE_TITLE', { EMOJI: `${emoji}`, NAME: emoji.name }))
			.setColor(Colors.Green)
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
