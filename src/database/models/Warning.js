const { Schema, model } = require('mongoose');

const warningSchema = Schema({
	userID: String,
	guildID: String,
	Warnings: Number,
	Reason: Array,
	Moderater: Array,
	IssueDates: Array,
});

module.exports = model('Warnings', warningSchema);
