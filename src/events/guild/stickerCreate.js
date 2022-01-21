// Dependencies
const { Embed } = require('../../utils'),
	Event = require('../../structures/Event');

/**
 * Sticker create event
 * @event Egglord#StickerCreate
 * @extends {Event}
*/
class StickerCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {Sticker} sticker The sticker that was created
	 * @readonly
	*/
	async run(bot, sticker) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Sticker: ${sticker.name} has been created in guild: ${sticker.guildId}. (${sticker.type})`);

		// fetch the user who made the sticker
		let user;
		try {
			user = await sticker.fetchUser();
		} catch (err) {
			bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		// Get server settings / if no settings then return
		const settings = sticker.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event channelCreate is for logging
		if (settings.ModLogEvents?.includes('STICKERCREATE') && settings.ModLog) {
			const embed = new Embed(bot, sticker.guild)
				.setDescription([
					`**Sticker created: ${sticker.name}**`, `${user ? ['', `Created by: ${user?.tag}`].join('\n') : []}`,
				].join('\n'))
				.setColor(3066993)
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

module.exports = StickerCreate;
