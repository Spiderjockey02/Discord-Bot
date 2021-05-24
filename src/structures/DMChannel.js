const { Structures } = require('discord.js');

module.exports = Structures.extend('DMChannel', Channel => {
	class CustomChannel extends Channel {
		// This will add the error emoji as the prefix and then translate the message
		error(key, args) {
			try {
				const emoji = this.client.customEmojis['cross'];
				return this.send({ embed:{ color:15158332, description:`${emoji} ${this.client.translate(key, args, this.client.config.defaultSettings.Language)}` } });
			} catch (err) {
				this.client.logger.error(err.message);
			}
		}

		// This will add the success emoji as the prefix and then translate the message
		success(key, args) {
			try {
				const emoji = this.client.customEmojis['checkmark'];
				return this.send({ embed:{ color:3066993, description:`${emoji} ${this.client.translate(key, args, this.client.config.defaultSettings.Language)}` } });
			} catch (err) {
				this.client.logger.error(err.message);
			}
		}
	}
	return CustomChannel;
});
