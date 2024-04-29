import { Schema, model } from 'mongoose';

const giveawaySchema = Schema({
	messageId: String,
	channelId: String,
	guildId: String,
	startAt: Number,
	endAt: Number,
	ended: Boolean,
	winnerCount: Number,
	winners: Array,
	prize: String,
	hostedBy: String,
	messages: Schema.Types.Mixed,
});

export default model('Giveaway', giveawaySchema);
