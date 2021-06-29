// Dependecies
const { MessageEmbed } = require('discord.js'),
	{ Structures } = require('discord.js');

module.exports = Structures.extend('DMChannel', Channel => {
	class CustomChannel extends Channel {
		// This will add the error emoji as the prefix and then translate the message
		error(key, args) {
			try {
				const emoji = this.client.customEmojis['cross'];
				const embed = new MessageEmbed()
					.setColor(15158332)
					.setDescription(`${emoji} ${this.client.translate(key, args, this.guild.settings.Language) ?? key}`);
				return this.send({ embeds: [embed] });
			} catch (err) {
				this.client.logger.error(err.message);
			}
		}

		// This will add the success emoji as the prefix and then translate the message
		success(key, args) {
			try {
				const emoji = this.client.customEmojis['checkmark'];
				const embed = new MessageEmbed()
					.setColor(3066993)
					.setDescription(`${emoji} ${this.client.translate(key, args, this.guild.settings.Language) ?? key}`);
				return this.send({ embeds: [embed] });
			} catch (err) {
				this.client.logger.error(err.message);
			}
		}
	}
	return CustomChannel;
});
