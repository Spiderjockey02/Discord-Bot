const { Schema, model } = require('mongoose');

const rankSchema = Schema({
	userID: String,
	guildID: String,
	Xp: Number,
	Level: Number,
});

module.exports = model('Ranks', rankSchema);
