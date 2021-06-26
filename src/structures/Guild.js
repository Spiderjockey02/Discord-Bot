// Dependencies
const { Structures } = require('discord.js'),
	{ GuildSchema } = require('../database/models'),
	{ Collection } = require('discord.js'),
	{ logger } = require('../utils');

module.exports = Structures.extend('Guild', Guild => {
	class CustomGuild extends Guild {
		constructor(bot, data) {
			super(bot, data);
			// This for caching server settings
			this.settings = {};

			// premium guild or not
			this.premium = false;

			// slash commands
			this.interactions = new Collection();
		}

		// Fetch guild settings (only on ready event)
		async fetchGuildConfig() {
			const data = await GuildSchema.findOne({ guildID: this.id });
			this.settings = data;
		}

		// update guild settings
		async updateGuild(settings) {
			logger.log(`Guild: [${this.id}] updated settings: ${Object.keys(settings)}`);
			return GuildSchema.findOneAndUpdate({ guildID: this.id }, settings).then(async () => await this.fetchGuildConfig());
		}

		// This will get the translation for the provided text
		translate(key, args) {
			const language = this.client.translations.get(this.settings.Language);
			if (!language) throw 'Invalid language set in data.';
			return language(key, args);
		}
	}
	return CustomGuild;
});
