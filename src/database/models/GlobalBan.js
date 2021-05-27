const { Schema, model } = require('mongoose');

const globalBanSchema = Schema({
	userID: String,
	reason: String,
	IssueDate: String,
});

module.exports = model('GlobalBan', globalBanSchema);
