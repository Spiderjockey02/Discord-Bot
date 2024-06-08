import { Guild } from 'discord.js';
import EgglordClient from '../base/Egglord';

// Add custom stuff to Guild
export default Object.defineProperties(Guild.prototype, {
	// Check if music is already playing in the guild
	isCurrentlyPlayingMusic: {
		value: function() {
			const musicSettings = this.settings.musicSystem;
			if (musicSettings == null) return false;

			// Check that a song is being played
			const player = this.client.audioManager?.players.get(this.guild.id);
			if (!player) return this.translate('music/misc:NO_QUEUE');
		},
	},
	fetchSettings: {
		value: async function() {
			const client = this.client as EgglordClient;
			this.settings = await client.databaseHandler.guildManager.fetchById(this.id);
			return this.settings;
		},
	},
	// Append the settings to guild
	settings: {
		value: {},
		writable: true,
	},
	level: {
		value: null,
		writable: true,
	},
	tickets: {
		value: null,
		writable: true,
	},
});
