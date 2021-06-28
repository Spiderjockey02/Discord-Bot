// Dependencies
const { Embed } = require('../../utils'),
	Event = require('../../structures/Event');

module.exports = class guildBanAdd extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, guildBan) {
		// Make sure all relevant data is fetched
		try {
			if (guildBan.partial) await guildBan.fetch();
			if (guildBan.user.partial) await guildBan.user.fetch();
		} catch (err) {
			return bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		// For debugging
		if (bot.config.debug) bot.logger.debug(`Member: ${guildBan.user.tag} has been banned in guild: ${guildBan.id}.`);

		// Get server settings / if no settings then return
		const settings = guildBan.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildBanAdd is for logging
		if (settings.ModLogEvents.includes('GUILDBANADD') && settings.ModLog) {
			const embed = new Embed(bot, guildBan)
				.setDescription(`${guildBan.user.toString()}\n${guildBan.user.tag}`)
				.setFooter(`ID: ${guildBan.user.id}`)
				.setThumbnail(`${guildBan.user.displayAvatarURL()}`)
				.setAuthor('User: Banned')
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${guildBan.id} logging channel`));
				if (modChannel && modChannel.guild.id == guildBan.id) bot.addEmbed(modChannel.id, [embed]);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
};
