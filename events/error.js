module.exports = async (bot, error) => {
	// LOG error event
	bot.logger.error(`An error event was sent by Discord.js: ${error.message}`);
};
