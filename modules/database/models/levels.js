const mongoose = require('mongoose');

const rankSchema = mongoose.Schema({
	userID: String,
	guildID: String,
	Xp: Number,
	Level: Number,
});

module.exports = mongoose.model('Ranks', rankSchema);
