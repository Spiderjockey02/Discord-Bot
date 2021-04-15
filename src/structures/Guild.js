// Dependencies
const { Structures } = require('discord.js'),
	{ GuildSchema } = require('../database/models'),
	logger = require('../utils/logger');

module.exports = Structures.extend('Guild', Guild => {
	class CustomGuild extends Guild {
		constructor(bot, data) {
			super(bot, data);
			// This for caching server settings
			this.settings = {};
		}

		// Fetch guild settings (only on ready event)
		async fetchGuildConfig() {
			const data = await GuildSchema.findOne({ guildID: this.id });
			this.settings = data;
		}

		// update guild settings
		async updateGuild(settings) {
			let data = this.settings;
			if (typeof data !== 'object') data = {};
			for (const key in settings) {
				if (settings.key) {
					if (data[key] !== settings[key]) data[key] = settings[key];
					else return;
				}
			}
			logger.log(`Guild: [${data.guildID}] updated settings: ${Object.keys(settings)}`);
			return await data.updateOne(settings).then(async () => await this.fetchGuildConfig());
		}
	}
	return CustomGuild;
});
