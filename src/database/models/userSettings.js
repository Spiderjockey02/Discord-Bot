const { Schema, model } = require('mongoose');

const warningSchema = Schema({
	userID: String,
	premium: { type: Boolean, default: false },
	// premium-only - custom rank background
	rankImage: String,
	// Will be used for the website (or DM's)
	Language: { type: String, default: 'en-US' },
	cmdBanned: { type: Boolean, default: false },
});

module.exports = model('Users', warningSchema);
