import { Event } from '../../structures';
import { Events, GuildEmoji } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { EgglordEmbed } from '../../utils';

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
		if (client.config.debug) client.logger.debug(`Emoji: ${emoji.name} has been created in guild: ${emoji.guild.id}.`);

		// Check if event emojiCreate is for logging
		const moderationSettings = emoji.guild.settings?.moderationSystem;
		if (moderationSettings && moderationSettings.loggingEvents.find(l => l.name == this.conf.name)) {
			const embed = new EgglordEmbed(client, emoji.guild)
				.setDescription(`**Emoji: ${emoji} (${emoji.name}) was created**`)
				.setColor(3066993)
				.setFooter({ text: `ID: ${emoji.id}` })
				.setAuthor({ name: emoji.guild.name, iconURL: emoji.guild.iconURL() ?? undefined })
				.setTimestamp();

			// Find channel and send message
			try {
				if (moderationSettings.loggingChannelId == null) return;
				const modChannel = await emoji.guild.channels.fetch(moderationSettings.loggingChannelId);
				if (modChannel) client.webhookManger.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}

