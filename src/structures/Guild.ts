// Dependencies
const { Guild } = require('discord.js'),
	{ GuildSchema, RankSchema } = require('../database/models'),
	{ logger } = require('../utils');

// Add custom stuff to Guild
module.exports = Object.defineProperties(Guild.prototype, {
	// Fetch guild settings
	fetchSettings: {
		value: async function() {
			this.settings = await GuildSchema.findOne({ guildID: this.id }) ?? require('../assets/json/defaultGuildSettings.json');
			return this.settings;
		},
	},
	// Update guild settings
	updateGuild: {
		value: async function(settings) {
			logger.log(`Guild: [${this.id}] updated settings: ${Object.keys(settings)}`);
			// Check if the DB is getting updated or creating new schema
			if (this.settings.guildID) {
				await GuildSchema.findOneAndUpdate({ guildID: this.id }, settings);
			} else {
				const newGuild = new GuildSchema(Object.assign({ guildID: this.id, guildName: this.name }, settings));
				await newGuild.save();
			}
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
	// Fetch ranks for this guild
	fetchLevels: {
		value: async function() {
			this.levels = await RankSchema.find({ guildID: this.id });
			return this.levels;
		},
	},
	// Append the settings to guild
	settings: {
		value: {},
		writable: true,
	},
	// Append guild-tags to guild
	guildTags: {
		value: [],
		writable: true,
	},
	// Append premium to guild
	premium: {
		value: false,
		writable: true,
	},
	// Append users' ranks to guild
	levels: {
		value: [],
		writable: true,
	},
});
