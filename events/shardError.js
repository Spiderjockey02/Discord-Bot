module.exports = async (bot, error) => {
	// LOG error event
	bot.logger.error(`${error.message}`);
};
