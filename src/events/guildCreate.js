// When the bot joins a server
const BOATS = require('boats.js');
const { post } = require('axios');
const BotList = require('botlist.space');

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

	// update https://botlist.space/ bot stats
	const client = new BotList.Client({ id: bot.user.id, botToken: require('../config.js').botlist_spaceAPI_KEY });
	client.postServerCount(bot.guilds.cache.size);
};
