const { Schema, model } = require('mongoose');

const mutedMemberSchema = Schema({
	userID: String,
	guildID: String,
});

module.exports = model('MutedMembers', mutedMemberSchema);
