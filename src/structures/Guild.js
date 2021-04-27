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

			// premium guild or not
			this.premium = false;
		}

		// Fetch guild settings (only on ready event)
		async fetchGuildConfig() {
			const data = await GuildSchema.findOne({ guildID: this.id });
			this.settings = data;
		}

		// update guild settings
		async updateGuild(settings) {
			logger.log(`Guild: [${this.id}] updated settings: ${Object.keys(settings)}`);
			return await GuildSchema.findOneAndUpdate({ guildID: this.id }, settings).then(async () => await this.fetchGuildConfig());
		}
	}
	return CustomGuild;
});
