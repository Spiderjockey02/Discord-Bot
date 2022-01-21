// Dependencies
const { Embed } = require('../../utils'),
	Event = require('../../structures/Event');

/**
 * Sticker delete event
 * @event Egglord#StickerDelete
 * @extends {Event}
*/
class StickerDelete extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {Sticker} sticker The sticker that was deleted
	 * @readonly
	*/
	async run(bot, sticker) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Sticker: ${sticker.name} has been deleted in guild: ${sticker.guildId}. (${sticker.type})`);

		// Get server settings / if no settings then return
		const settings = sticker.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event channelCreate is for logging
		if (settings.ModLogEvents?.includes('STICKERDELETE') && settings.ModLog) {
			const embed = new Embed(bot, sticker.guild)
				.setDescription(`**Sticker deleted: ${sticker.name}**`)
				.setColor(15158332)
				.setImage(`https://cdn.discordapp.com/stickers/${sticker.id}.png`)
				.setFooter({ text: sticker.guild.translate('misc:ID', { ID: sticker.id }) })
				.setAuthor({ name: bot.user.username, iconURL: bot.user.displayAvatarURL() })
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${sticker.guildId} logging channel`));
				if (modChannel && modChannel.guild.id == sticker.guildId) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}

module.exports = StickerDelete;
