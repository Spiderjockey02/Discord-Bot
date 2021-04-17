const { Schema, model } = require('mongoose');

const warningSchema = Schema({
	userID: String,
	guildID: String,
	Reason: String,
	Moderater: String,
	IssueDate: String,
});

module.exports = model('Warnings', warningSchema);
