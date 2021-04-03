const { Schema, model } = require('mongoose');

const giveawaySchema = Schema({
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
	messages: Schema.Types.Mixed,
});

module.exports = model('Giveaway', giveawaySchema);
