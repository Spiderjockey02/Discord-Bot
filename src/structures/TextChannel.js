// Dependecies
const { MessageEmbed } = require('discord.js'),
	{ TextChannel } = require('discord.js');

module.exports = Object.defineProperties(TextChannel.prototype, {
	// Send custom 'error' message
	error: {
		value: function(key, args, returnValue) {
			try {
				const emoji = this.permissionsFor(this.client.user).has('USE_EXTERNAL_EMOJIS') ? this.client.customEmojis['cross'] : ':negative_squared_cross_mark:';
				const embed = new MessageEmbed()
					.setColor(15158332)
					.setDescription(`${emoji} ${this.client.translate(key, args, this.guild.settings.Language) ?? key}`);
				if (returnValue) {
					return embed;
				} else {
					return this.send({ embeds: [embed] });
				}
			} catch (err) {
				this.client.logger.error(err.message);
			}
		},
	},
	// Send custom 'success' message
	success: {
		value: function(key, args, returnValue) {
			try {
				const emoji = this.permissionsFor(this.client.user).has('USE_EXTERNAL_EMOJIS') ? this.client.customEmojis['checkmark'] : ':white_check_mark:';
				const embed = new MessageEmbed()
					.setColor(3066993)
					.setDescription(`${emoji} ${this.client.translate(key, args, this.guild.settings.Language) ?? key}`);
				if (returnValue) {
					return embed;
				} else {
					return this.send({ embeds: [embed] });
				}
			} catch (err) {
				this.client.logger.error(err.message);
			}
		},
	},
});
