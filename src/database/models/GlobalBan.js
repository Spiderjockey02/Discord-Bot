const { Schema, model } = require('mongoose');

const globalBanSchema = Schema({
	userID: String,
	reason: String,
	IssueDate: String,
	restriction: String,
});

module.exports = model('GlobalBan', globalBanSchema);
