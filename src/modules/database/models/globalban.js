const mongoose = require('mongoose');

const globalBanSchema = mongoose.Schema({
	userID: String,
	reason: String,
	IssueDate: String,
	restriction: String,
});

module.exports = mongoose.model('GlobalBan', globalBanSchema);
