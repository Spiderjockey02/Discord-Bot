const mongoose = require('mongoose');

const playlistSchema = mongoose.Schema({
	name: String,
	songs: Array,
	timeCreated: Number,
	thumbnail: String,
	creator: String,
});

module.exports = mongoose.model('playlists', playlistSchema);
