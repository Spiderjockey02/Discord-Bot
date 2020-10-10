const mongoose = require('mongoose');

const warningSchema = mongoose.Schema({
	userID: String,
	guildID: String,
	Warnings: Number,
	Reason: Array,
	IssueDate: Date,
});

module.exports = mongoose.model('Warnings', warningSchema);
