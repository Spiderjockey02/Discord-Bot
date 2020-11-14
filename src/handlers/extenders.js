const { Message } = require('discord.js');

module.exports = async (bot) => {
// This will translate the message to the server's language
	Message.prototype.translate = function(language, key, args) {
		let languageFile;
		if (key.includes('/')) {
			const word = key.split('/');
			languageFile = require(`../languages/${language}/${word[0]}/translation`);
			return languageFile(word[1], args);
		} else {
			languageFile = require(`../languages/${language}/misc`);
			return languageFile(key, args);
		}
	};

	// This will send the translated message
	Message.prototype.sendT = function(language, key, args) {
		try {
			return this.channel.send(this.translate(language, key, args));
		} catch (err) {
			bot.logger.error(err.message);
		}
	};

	// This will add the error emoji as the prefix and then translate the message
	Message.prototype.error = function(language, key, args) {
		try {
			let emoji;
			if (this.channel.type == 'dm') {
				emoji = bot.config.emojis.cross;
			} else {
				emoji = this.channel.permissionsFor(bot.user).has('USE_EXTERNAL_EMOJIS') ? bot.config.emojis.cross : ':negative_squared_cross_mark:';
			}
			return this.channel.send({ embed:{ color:15158332, description:`${emoji} ${this.translate(language, key, args)}` } });
		} catch (err) {
			bot.logger.error(err.message);
		}
	};

	// This will add the success emoji as the prefix and then translate the message
	Message.prototype.success = function(language, key, args) {
		try {
			let emoji;
			if (this.channel.type == 'dm') {
				emoji = bot.config.emojis.tick;
			} else {
				emoji = this.channel.permissionsFor(bot.user).has('USE_EXTERNAL_EMOJIS') ? bot.config.emojis.tick : ':white_check_mark:';
			}
			return this.channel.send({ embed:{ color:3066993, description:`${emoji} ${this.translate(language, key, args)}` } });
		} catch (err) {
			bot.logger.error(err.message);
		}
	};
};
