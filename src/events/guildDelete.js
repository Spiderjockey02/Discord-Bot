// When the bot leaves a guild
module.exports = async (bot, guild) => {
	bot.logger.log(`[GUILD LEAVE] ${guild.name} (${guild.id}) removed the bot.`);
	// Delete server settings
	await bot.DeleteGuild(guild);
};
