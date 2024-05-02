import { User } from 'discord.js';

export default Object.defineProperties(User.prototype, {
	// If the user is premium or not
	isPremiumTo: {
		value: null,
		writable: true,
		enumerable: true,
	},
});
