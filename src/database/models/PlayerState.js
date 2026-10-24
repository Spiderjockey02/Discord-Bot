const { Schema, model } = require('mongoose');

// A guild's music queue, saved so playback carries on after the bot restarts
const playerStateSchema = Schema({
	guildID: { type: String, unique: true, index: true },
	voiceChannel: String,
	textChannel: String,
	current: Object,
	position: { type: Number, default: 0 },
	queue: { type: Array, default: [] },
	volume: { type: Number, default: 100 },
	paused: { type: Boolean, default: false },
	trackRepeat: { type: Boolean, default: false },
	queueRepeat: { type: Boolean, default: false },
	autoplay: { type: Boolean, default: false },
	twentyFourSeven: { type: Boolean, default: false },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = model('PlayerState', playerStateSchema);
