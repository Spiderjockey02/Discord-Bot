const { Schema, model } = require('mongoose');

const tagsSchema = Schema({
	guildID: String,
	name: String,
	response: String,
});

module.exports = model('GuildTags', tagsSchema);
