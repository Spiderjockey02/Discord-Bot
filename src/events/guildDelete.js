// When the bot leaves a guild
const BOATS = require('boats.js');

module.exports = async (bot, guild) => {
	bot.logger.log(`[GUILD LEAVE] ${guild.name} (${guild.id}) removed the bot.`);
	// Delete server settings
	await bot.DeleteGuild(guild);

	// update Discord.boats website
	const Boats = new BOATS(bot.config.DiscordBoatAPI_Key);
	await Boats.postStats(bot.guilds.cache.size, '647203942903840779');
};
