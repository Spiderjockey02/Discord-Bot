import { Schema, model } from 'mongoose';

const tagsSchema = new Schema({
	guildID: String,
	name: String,
	response: String,
});

export default model('GuildTags', tagsSchema);
