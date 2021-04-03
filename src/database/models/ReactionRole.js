const { Schema, model } = require('mongoose');

const reactionRoleSchema = Schema({
	guildID: String,
	messageID: String,
	channelID: String,
	reactions: Array,
});

module.exports = model('ReactionRole', reactionRoleSchema);
