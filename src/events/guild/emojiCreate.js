// Dependencies
const { Embed } = require('../../utils'),
	Event = require('../../structures/Event');

/**
 * Emoji create event
 * @event Egglord#EmojiCreate
 * @extends {Event}
*/
class EmojiCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {GuildEmoji} emoji The emoji that was created
	 * @readonly
	*/
	async run(bot, emoji) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Emoji: ${emoji.name} has been created in guild: ${emoji.guild.id}.`);

		// Get server settings / if no settings then return
		const settings = emoji.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event emojiCreate is for logging
		if (settings.ModLogEvents?.includes('EMOJICREATE') && settings.ModLog) {
			const embed = new Embed(bot, emoji.guild)
				.setDescription(`**Emoji: ${emoji} (${emoji.name}) was created**`)
				.setColor(3066993)
				.setFooter({ text: `ID: ${emoji.id}` })
				.setAuthor({ name: emoji.guild.name, iconURL: emoji.guild.iconURL() })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${emoji.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == emoji.guild.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}

module.exports = EmojiCreate;
