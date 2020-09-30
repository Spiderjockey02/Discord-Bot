// When the bot joins a server
const BOATS = require('boats.js');

module.exports = async (bot, guild) => {
	// LOG server Join
	bot.logger.log(`[GUILD JOIN] ${guild.name} (${guild.id}) added the bot.`);

	// Apply server settings
	try {
		const newGuild = {
			guildID: guild.id,
			guildName: guild.name,
		};
		await bot.CreateGuild(newGuild);
	} catch (e) {
		console.error(e);
	}

	// update Discord.boats website
	const Boats = new BOATS(bot.config.DiscordBoatAPI_Key);
	await Boats.postStats(bot.guilds.cache.size, '647203942903840779');
};
