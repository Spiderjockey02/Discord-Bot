import { GuildMember } from 'discord.js';
import { Player } from 'magmastream';

// Add custom stuff to GuildMember
export default Object.defineProperties(GuildMember.prototype, {
	canPlayMusic: {
		value: function(player: Player) {
			// Check that user is in the same voice channel
			if (this.voice?.channel?.id !== player.voiceChannel) return this.guild.translate('misc:NOT_VOICE');

			const musicSettings = this.guild.settings.musicSystem;
			if (musicSettings == null) return false;

			// Check if the member has role to interact with music plugin
			if (musicSettings.djRoleId && this.guild.roles.cache.get(musicSettings.djRoleId)) {
				if (!this.roles.cache.has(musicSettings.djRoleId)) {
					return this.guild.translate('misc:MISSING_ROLE');
				}
			}
			return true;
		},
	},
});