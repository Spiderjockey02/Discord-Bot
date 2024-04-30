import { Schema, model } from 'mongoose';

const reactionRoleSchema = new Schema({
	guildID: String,
	messageID: String,
	channelID: String,
	reactions: Array,
});

export default model('ReactionRole', reactionRoleSchema);
