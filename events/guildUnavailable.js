// when a server has become unavailable
module.exports = async (bot, guild) => {
	// LOG error event
	bot.logger.log(`[GUILD UNAVAILABLE] ${guild.name} (${guild.id}).`);
};
