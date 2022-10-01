// Dependecies
const { EmbedBuilder, TextChannel, PermissionsBitField: { Flags } } = require('discord.js');

// override send method
const oriSend = TextChannel.prototype.send;
TextChannel.prototype.send = function(...args) {
	const send = oriSend.bind(this);
	// check permissions
	if (!this.permissionsFor(this.client.user).has(Flags.SendMessages)) return;
	if (!this.permissionsFor(this.client.user).has(Flags.EmbedLinks)) {
		return send(this.client.translate('misc:MISSING_PERMISSION', { PERMISSIONS: this.client.translate('permissions:EMBED_LINKS', {}, this.guild.settings.Language) }, this.guild.settings.Language));
	}

	// send message
	try {
		return send(...args);
	} catch (err) {
		this.client.logger.error(err.message);
	}
};

// Custom TextChannel
module.exports = Object.defineProperties(TextChannel.prototype, {
	// Send custom 'error' message
	error: {
		value: function(key, args, isForEmbed) {
			try {
				const emoji = this.permissionsFor(this.client.user).has(Flags.UseExternalEmojis) ? this.client.customEmojis['cross'] : ':negative_squared_cross_mark:';
				const embed = new EmbedBuilder()
					.setColor(15158332)
					.setDescription(`${emoji} ${this.client.translate(key, args, this.guild.settings.Language) ?? key}`);

				// Either return the error embed or send the error message
				if (isForEmbed) return embed;
				this.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 5000 }));
			} catch (err) {
				this.client.logger.error(err.message);
			}
		},
	},
	// Send custom 'success' message
	success: {
		value: function(key, args, isForEmbed) {
			try {
				const emoji = this.permissionsFor(this.client.user).has(Flags.UseExternalEmojis) ? this.client.customEmojis['checkmark'] : ':white_check_mark:';
				const embed = new EmbedBuilder()
					.setColor(3066993)
					.setDescription(`${emoji} ${this.client.translate(key, args, this.guild.settings.Language) ?? key}`);
				return isForEmbed ? embed : this.send({ embeds: [embed] });
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
