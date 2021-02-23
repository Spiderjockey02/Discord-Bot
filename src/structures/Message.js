const { Structures } = require('discord.js');

module.exports = Structures.extend('Message', Message => {
	class CustomMessage extends Message {
		constructor(bot, data, channel) {
			super(bot, data, channel);
		}

		// This will get the translation for the provided text
		translate(language, key, args) {
			let languageFile;
			if (key.includes('/')) {
				const word = key.split('/');
				languageFile = require(`../languages/${language}/${word[0]}/translation`);
				return languageFile(word[1], args);
			} else {
				languageFile = require(`../languages/${language}/misc`);
				return languageFile(key, args);
			}
		}

		// This will send the translated message
		sendT(language, key, args) {
			try {
				return this.channel.send(this.translate(language, key, args));
			} catch (err) {
				this.client.logger.error(err.message);
			}
		}

		// This will add the error emoji as the prefix and then translate the message
		error(language, key, args) {
			try {
				let emoji;
				if (this.channel.type == 'dm') {
					emoji = this.client.config.emojis.cross;
				} else {
					emoji = this.channel.permissionsFor(this.client.user).has('USE_EXTERNAL_EMOJIS') ? this.client.config.emojis.cross : ':negative_squared_cross_mark:';
				}
				return this.channel.send({ embed:{ color:15158332, description:`${emoji} ${this.translate(language, key, args)}` } });
			} catch (err) {
				this.client.logger.error(err.message);
			}
		}

		// This will add the success emoji as the prefix and then translate the message
		success(language, key, args) {
			try {
				let emoji;
				if (this.channel.type == 'dm') {
					emoji = this.client.config.emojis.tick;
				} else {
					emoji = this.channel.permissionsFor(this.client.user).has('USE_EXTERNAL_EMOJIS') ? this.client.config.emojis.tick : ':white_check_mark:';
				}
				return this.channel.send({ embed:{ color:3066993, description:`${emoji} ${this.translate(language, key, args)}` } });
			} catch (err) {
				this.client.logger.error(err.message);
			}
		}
	}
	return CustomMessage;
});
