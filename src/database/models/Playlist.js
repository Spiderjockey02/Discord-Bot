const { Schema, model } = require('mongoose');

const playlistSchema = Schema({
	name: String,
	songs: Array,
	timeCreated: Number,
	thumbnail: String,
	creator: String,
	duration: String,
});

module.exports = model('playlists', playlistSchema);
