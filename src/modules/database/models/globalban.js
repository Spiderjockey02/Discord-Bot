const mongoose = require('mongoose');

const globalBanSchema = mongoose.Schema({
	userID: String,
	guildID: String,
	reason: String,
});

module.exports = mongoose.model('GlobalBan', globalBanSchema);
