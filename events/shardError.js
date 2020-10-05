module.exports = async (bot, error) => {
	// LOG error event
	bot.logger.log(error.message);
};
