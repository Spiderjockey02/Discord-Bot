const { User } = require('discord.js');

module.exports = Object.defineProperties(User.prototype, {
	// If the user is premium or not
	premium: {
		value: false,
		writable: true,
		enumerable: true,
	},
	// When the user gained premium
	premiumSince: {
		value: '',
		writable: true,
		enumerable: true,
	},
	// Are they banned from using the bot's commands (in Guild & DM's)
	cmdBanned: {
		value: false,
		writable: true,
		enumerable: true,
	},
	// Custom rank image background
	rankImage: {
		value: '',
		writable: true,
		enumerable: true,
	},
});
