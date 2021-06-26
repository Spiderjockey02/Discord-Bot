// Dependencies
const express = require('express'),
	router = express.Router();

module.exports = (bot) => {
	// statistics page
	router.get('/', async function(req, res) {
		if (bot.config.debug) bot.logger.debug(`IP: ${req.connection.remoteAddress.slice(7)} accessed \`/statistics\`.`);

		res.status(200).json({
			guildCount: bot.guilds.cache.size,
			cachedUsers: bot.users.cache.size,
			totalMembers: bot.guilds.cache.map(g => g).reduce((a, b) => a + b.memberCount, 0),
			uptime: process.uptime() * 1000,
			commandCount: bot.commands.size,
			memoryUsed: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
			textChannels: bot.channels.cache.filter(channel => channel.type === 'text').size,
			voiceChannels: bot.channels.cache.filter(channel => channel.type === 'voice').size,
			MessagesSeen: bot.messagesSent,
			CommandsRan: bot.commandsUsed,
			ping: Math.round(bot.ws.ping),
		});
	});

	return router;
};
