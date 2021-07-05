const { Schema, model } = require('mongoose');

const userSchema = Schema({
	userID: String,
	premium: { type: Boolean, default: false },
	premiumSince: String,
	// premium-only - custom rank background
	rankImage: Schema.Types.Buffer,
	// Will be used for the website (or DM's)
	Language: { type: String, default: 'en-US' },
	// If the user is banned from using commands or not
	cmdBanned: { type: Boolean, default: false },
});

module.exports = model('Users', userSchema);
