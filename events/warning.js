module.exports = async (bot, info) => {
	// LOG error event
	bot.logger.log(`An error event was sent by Discord.js: ${info}`, 'warn');
};
