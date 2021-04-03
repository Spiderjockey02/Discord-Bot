module.exports = async (bot, rateLimitInfo) => {
	if (bot.config.debug) {
		console.log(rateLimitInfo);
	}
};
