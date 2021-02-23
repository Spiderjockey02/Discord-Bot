const { Structures } = require('discord.js');

module.exports = Structures.extend('User', User => {
	class CustomUser extends User {
		constructor(bot, data) {
			super(bot, data);
			this.premium = false;
		}
	}
	return CustomUser;
});
