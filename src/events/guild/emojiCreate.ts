import Event from 'src/structures/Event';
import { Events, GuildEmoji } from 'discord.js';
import EgglordClient from 'src/base/Egglord';

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

		// Get server settings / if no settings then return
		const settings = emoji.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event emojiCreate is for logging
		if (settings.ModLogEvents?.includes('EMOJICREATE') && settings.ModLog) {
			const embed = new Embed(client, emoji.guild)
				.setDescription(`**Emoji: ${emoji} (${emoji.name}) was created**`)
				.setColor(3066993)
				.setFooter({ text: `ID: ${emoji.id}` })
				.setAuthor({ name: emoji.guild.name, iconURL: emoji.guild.iconURL() })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await client.channels.fetch(settings.ModLogChannel).catch(() => client.logger.error(`Error fetching guild: ${emoji.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == emoji.guild.id) client.webhookManger.addEmbed(modChannel.id, [embed]);
			} catch (err: any) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}

