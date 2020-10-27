const mongoose = require('mongoose');

const warningSchema = mongoose.Schema({
	userID: String,
	guildID: String,
	Warnings: Number,
	Reason: Array,
	Moderater: Array,
	IssueDates: Array,
});

module.exports = mongoose.model('Warnings', warningSchema);
