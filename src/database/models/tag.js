import { Schema, model } from 'mongoose';

const tagsSchema = Schema({
	guildID: String,
	name: String,
	response: String,
});

export default model('GuildTags', tagsSchema);
