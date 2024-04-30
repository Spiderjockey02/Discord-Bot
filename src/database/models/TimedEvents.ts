import { Schema, model } from 'mongoose';

const timeEventSchema = new Schema({
	userID: String,
	guildID: String,
	type: String,
	time: String,
	// optional data
	channelID: String,
	message: String,
});

export default model('timedEvents', timeEventSchema);
