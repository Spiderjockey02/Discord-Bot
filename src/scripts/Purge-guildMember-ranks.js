// Dependencies
const { RankSchema } = require('../database/models');

module.exports.run = async (bot) => {
	RankSchema.find({}, async (err, res) => {
		if (err) {
			bot.logger.error('Error deleting ranks.');
		}

		// now check data
		for (let i = 0; i < res.length; i++) {
			try {
				await bot.guilds.cache.get(res[i].guildID).members.fetch(res[i].userID);
			} catch (e) {
				// Delete rank as user is no longer in guild
				bot.logger.log(`Deleting user ${res[i].userID}'s rank from guild ${res[i].guildID}.`);
				await RankSchema.findByIdAndRemove(res[i]._id, (err) => {
					if (err) console.log(err);
				});
			}
		}
	});
};
