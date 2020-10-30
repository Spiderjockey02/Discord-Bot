// Dependencies
const BOATS = require('boats.js');
const { post } = require('axios');
const BotList = require('botlist.space');

// When the bot joins a server
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
	// Check to see if bot is connected to any Discord bot websites
	if (bot.config.DiscordBotLists) {
		// Check if bot is connected to https://discord.boats/
		if (bot.config.DiscordBotLists.DiscordBoatAPI_Key) {
			// update Discord.boats website
			const Boats = new BOATS(bot.config.DiscordBoatAPI_Key);
			await Boats.postStats(bot.guilds.cache.size, '647203942903840779');
		}
		// update https://arcane-center.xyz/ bot stats
		if (bot.config.DiscordBotLists.ArcaneBotAPI_KEY) {
			// update https://arcane-center.xyz/ bot stats
			post(`https://arcane-center.xyz/api/${bot.user.id}/stats`, { server_count: bot.guilds.cache.size, shard_count: bot.options.shardCount }, {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': require('../config.js').ArcaneBotAPI_KEY,
				},
			}).then(res => {
				console.log(res);
			}).catch(err => {
				console.error(err);
			});
		}
		// update https://botlist.space/ bot stats
		if (bot.config.DiscordBotLists.botlist_spaceAPI_KEY) {
			const client = new BotList.Client({ id: bot.user.id, botToken: require('../config.js').botlist_spaceAPI_KEY });
			await client.postServerCount(bot.guilds.cache.size).catch(e => console.log(e));
		}
	}
};
