// Dependecies
const { MessageEmbed } = require('discord.js'),
	{ DMChannel } = require('discord.js');

module.exports = Object.defineProperties(DMChannel.prototype, {
	// Send custom 'error' message
	error: {
		value: function(key, args) {
			try {
				const emoji = this.client.customEmojis['cross'];
				const embed = new MessageEmbed()
					.setColor(15158332)
					.setDescription(`${emoji} ${this.client.translate(key, args, require('../assets/json/defaultGuildSettings.json').Language) ?? key}`);
				return this.send({ embeds: [embed] });
			} catch (err) {
				this.client.logger.error(err.message);
			}
		},
	},
	// Send custom 'success' message
	success: {
		value: function(key, args) {
			try {
				const emoji = this.client.customEmojis['checkmark'];
				const embed = new MessageEmbed()
					.setColor(3066993)
					.setDescription(`${emoji} ${this.client.translate(key, args, require('../assets/json/defaultGuildSettings.json').Language) ?? key}`);
				return this.send({ embeds: [embed] });
			} catch (err) {
				this.client.logger.error(err.message);
			}
		},
	},
	// Check if bot has permission to send custom emoji
	checkPerm: {
		value: function() {
			return true;
		},
	},
});
