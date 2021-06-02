const { Structures } = require('discord.js');

module.exports = Structures.extend('TextChannel', Channel => {
	class CustomChannel extends Channel {
		// This will send the translated message
		async send(...args) {
			// check permissions
			if (!this.permissionsFor(this.client.user).has('SEND_MESSAGES')) return;
			if (!this.permissionsFor(this.client.user).has('EMBED_LINKS')) {
				return super.send(this.client.translate('misc:MISSING_PERMISSION', { PERMISSIONS: this.client.translate('permissions:EMBED_LINKS', {}, this.guild.settings.Language) }, this.guild.settings.Language));
			}

			// send message
			try {
				return await super.send(...args);
			} catch (err) {
				this.client.logger.error(err.message);
			}
		}

		// This will add the error emoji as the prefix and then translate the message
		error(key, args) {
			try {
				const emoji = this.permissionsFor(this.client.user).has('USE_EXTERNAL_EMOJIS') ? this.client.customEmojis['cross'] : ':negative_squared_cross_mark:';
				return this.send({ embed:{ color:15158332, description:`${emoji} ${this.client.translate(key, args, this.guild.settings.Language)}` } });
			} catch (err) {
				this.client.logger.error(err.message);
			}
		}

		// This will add the success emoji as the prefix and then translate the message
		success(key, args) {
			try {
				const emoji = this.permissionsFor(this.client.user).has('USE_EXTERNAL_EMOJIS') ? this.client.customEmojis['checkmark'] : ':white_check_mark:';
				return this.send({ embed:{ color:3066993, description:`${emoji} ${this.client.translate(key, args, this.guild.settings.Language)}` } });
			} catch (err) {
				this.client.logger.error(err.message);
			}
		}
	}
	return CustomChannel;
});
