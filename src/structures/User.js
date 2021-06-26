const { Structures } = require('discord.js');

module.exports = Structures.extend('User', User => {
	class CustomUser extends User {
		constructor(bot, data) {
			super(bot, data);
			this.premium = false;
			// If they are banned from using commands
			this.cmdBanned = false;
			// For custom rank background
			this.rankImage = '';
		}
	}
	return CustomUser;
});
