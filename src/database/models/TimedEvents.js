const { Schema, model } = require('mongoose');

const timeEventSchema = Schema({
	userID: String,
	guildID: String,
	type: String,
	time: String,
	// optional data
	channelID: String,
	message: String,
});

module.exports = model('timedEvents', timeEventSchema);
