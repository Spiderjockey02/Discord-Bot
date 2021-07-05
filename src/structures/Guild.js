// Dependencies
const { Guild } = require('discord.js'),
	{ GuildSchema } = require('../database/models'),
	{ logger } = require('../utils');

// Add custom stuff to Guild
module.exports = Object.defineProperties(Guild.prototype, {
	// Fetch guild settings
	fetchSettings: {
		value: async function() {
			this.settings = await GuildSchema.findOne({ guildID: this.id });
			return this.settings;
		},
	},
	// Update guild settings
	updateGuild: {
		value: async function(settings) {
			logger.log(`Guild: [${this.id}] updated settings: ${Object.keys(settings)}`);
			await GuildSchema.findOneAndUpdate({ guildID: this.id }, settings);
			return this.fetchSettings();
		},
	},
	// Used for translating strings
	translate: {
		value: function(key, args) {
			const language = this.client.translations.get(this.settings.Language);
			if (!language) return 'Invalid language set in data.';
			return language(key, args);
		},
	},
	// Append the settings to guild
	settings: {
		value: {},
		writable: true,
	},
	// Append premium to guild
	premium: {
		value: false,
		writable: true,
	},
});
