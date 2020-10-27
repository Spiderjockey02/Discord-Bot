module.exports = async (bot, info) => {
	// LOG error event
	if (bot.config.debug) {
		bot.logger.debug(info);
	}
};
