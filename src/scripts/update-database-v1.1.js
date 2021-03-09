// Dependecies
const mongoose = require('mongoose'),
	logger = require('../modules/logging'),
	config = require('../config.js'),
	{ Guild } = require('../modules/database/models');

module.exports = async () => {
	mongoose.connect(config.MongoDBURl, { useUnifiedTopology: true, useNewUrlParser: true }).then(async () => {
		logger.log('Updating database');
		await Guild.updateMany({ version: { $exists: false } }, [
			{ $set: { plugins: ['Fun', 'Giveaway', 'Guild', 'Image', 'Level', 'Misc', 'Moderation', 'Music', 'NSFW', 'Plugins', 'Recording', 'Searcher', 'Ticket'], version: '1.1' } },
			{ $unset: ['NSFWPlugin', ' SearchPlugin', 'ModerationPlugin', 'MusicPlugin', 'LevelPlugin'] },
		]);
		logger.ready('Database has been updated to v1.1');
	}).catch((err) => {
		console.log(err);
	});
};
