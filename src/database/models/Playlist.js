import { Schema, model } from 'mongoose';

const playlistSchema = Schema({
	name: String,
	songs: Array,
	timeCreated: Number,
	thumbnail: String,
	creator: String,
	duration: String,
});

export default model('playlists', playlistSchema);
