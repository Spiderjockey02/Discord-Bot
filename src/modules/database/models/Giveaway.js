const mongoose = require('mongoose');

const giveawaySchema = mongoose.Schema({
	messageID: String,
	channelID: String,
	guildID: String,
	startAt: Number,
	endAt: Number,
	ended: Boolean,
	winnerCount: Number,
	winners: Array,
	prize: String,
	hostedBy: String,
	messages: mongoose.Schema.Types.Mixed,
});

module.exports = mongoose.model('Giveaway', giveawaySchema);
