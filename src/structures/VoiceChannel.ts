// Dependecies
const { EmbedBuilder, VoiceChannel, PermissionsBitField: { Flags } } = require('discord.js');

// Custom VoiceChannel
module.exports = Object.defineProperties(VoiceChannel.prototype, {
	// Send custom 'error' message
	error: {
		value: function(key, args, returnValue) {
			try {
				const emoji = this.permissionsFor(this.client.user).has(Flags.useExternalEmojis) ? this.client.customEmojis['cross'] : ':negative_squared_cross_mark:';
				const embed = new EmbedBuilder()
					.setColor(15158332)
					.setDescription(`${emoji} ${this.client.translate(key, args, this.guild.settings.Language) ?? key}`);
				return returnValue ? embed : this.send({ embeds: [embed] });
			} catch (err) {
				this.client.logger.error(err.message);
			}
		},
	},
	// Send custom 'success' message
	success: {
		value: function(key, args, returnValue) {
			try {
				const emoji = this.permissionsFor(this.client.user).has(Flags.useExternalEmojis) ? this.client.customEmojis['checkmark'] : ':white_check_mark:';
				const embed = new EmbedBuilder()
					.setColor(3066993)
					.setDescription(`${emoji} ${this.client.translate(key, args, this.guild.settings.Language) ?? key}`);
				return returnValue ? embed : this.send({ embeds: [embed] });
			} catch (err) {
				this.client.logger.error(err.message);
			}
		},
	},
	// Check if bot has permission to send custom emoji
	checkPerm: {
		value: function(perm) {
			try {
				return this.permissionsFor(this.client.user).has(perm);
			} catch {
				return false;
			}
		},
	},
});
