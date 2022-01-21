// Dependencies
const { Embed } = require('../../utils'),
	Event = require('../../structures/Event');

/**
 * Sticker update event
 * @event Egglord#StickerUpdate
 * @extends {Event}
*/
class StickerUpdate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {Sticker} oldSticker The sticker before the update
	 * @param {Sticker} newSticker The sticker after the update
	 * @readonly
	*/
	async run(bot, oldSticker, newSticker) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Sticker: ${newSticker.name} has been updated in guild: ${newSticker.guildId}. (${newSticker.type})`);

		// Get server settings / if no settings then return
		const settings = newSticker.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event channelCreate is for logging
		if (settings.ModLogEvents?.includes('STICKERUPDATE') && settings.ModLog) {
			let embed, updated = false;

			// sticker name change
			if (oldSticker.name != newSticker.name) {
				embed = new Embed(bot, newSticker.guild)
					.setDescription(`Sticker name changed of ${newSticker.name}**`)
					.setColor(15105570)
					.setFooter({ text: `ID: ${newSticker.id}` })
					.setAuthor({ name: newSticker.guild.name, iconURL: newSticker.guild.iconURL() })
					.addFields(
						{ name: 'Old:', value: `${oldSticker.name}`, inline: true },
						{ name: 'New:', value: `${newSticker.name}`, inline: true },
					)
					.setTimestamp();
				updated = true;
			}

			// sticker description change
			if (oldSticker.description != newSticker.description) {
				embed = new Embed(bot, newSticker.guild)
					.setDescription(`Sticker description changed of ${newSticker.name}**`)
					.setColor(15105570)
					.setFooter({ text: `ID: ${newSticker.id}` })
					.setAuthor({ name: newSticker.guild.name, iconURL: newSticker.guild.iconURL() })
					.addFields(
						{ name: 'Old:', value: `${oldSticker.description}`, inline: true },
						{ name: 'New:', value: `${newSticker.description}`, inline: true },
					)
					.setTimestamp();
				updated = true;
			}

			// Find channel and send message
			if (updated) {
				try {
					const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${newSticker.guildId} logging channel`));
					if (modChannel && modChannel.guild.id == newSticker.guildId) bot.addEmbed(modChannel.id, [embed]);
				} catch (err) {
					bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
				}
			}
		}
	}
}

module.exports = StickerUpdate;
