// Dependencies
const express = require('express'),
	router = express.Router();

module.exports = (bot) => {
	// statistics page
	router.get('/', async (req, res) => {

		res.status(200).json({
			guildCount: bot.guilds.cache.size,
			cachedUsers: bot.users.cache.size,
			totalMembers: bot.guilds.cache.map(g => g).reduce((a, b) => a + b.memberCount, 0),
			uptime: Math.round(process.uptime() * 1000),
			commandCount: bot.commands.size,
			memoryUsed: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
			textChannels: bot.channels.cache.filter(({ type }) => type === 'GUILD_TEXT').size,
			voiceChannels: bot.channels.cache.filter(({ type }) => type === 'GUILD_VOICE').size,
			MessagesSeen: bot.messagesSent,
			CommandsRan: bot.commandsUsed,
			ping: Math.round(bot.ws.ping),
			Lavalink: bot.manager.nodes.map(node => ({
				name: node.options.identifier,
				stats: node.stats,
			})),
		});
	});

	return router;
};
