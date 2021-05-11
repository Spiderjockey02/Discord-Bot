const { Schema, model } = require('mongoose');

const ticketEmbedSchema = Schema({
	messageID: String,
	channelID: String,
	guildID: String,
});

module.exports = model('ticketEmbed', ticketEmbedSchema);
