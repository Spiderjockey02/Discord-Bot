const { Schema, model } = require('mongoose');

const playlistSchema = Schema({
	command: String,
	userID: String,
	IssueDate: String,
});

module.exports = model('timedEvents', playlistSchema);
