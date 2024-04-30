import { Schema, model } from 'mongoose';

const rankSchema = new Schema({
	userID: String,
	guildID: String,
	Xp: Number,
	Level: Number,
});

export default model('Ranks', rankSchema);
