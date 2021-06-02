// Dependecies
const express = require('express'),
	router = express.Router();

module.exports = function(bot) {
	// statistics page
	router.get('/', async function(req, res) {
		if (bot.config.debug) bot.logger.debug(`IP: ${req.connection.remoteAddress.slice(7)} accessed \`/statistics\`.`);

		res.status(200).json({
			guildCount: bot.guilds.cache.size,
			userCount: bot.users.cache.size,
			uptime: process.uptime() * 1000,
			commandCount: bot.commands.size,
			memoryUsed: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
			textChannels: bot.channels.cache.filter(channel => channel.type === 'text').size,
			voiceChannels: bot.channels.cache.filter(channel => channel.type === 'voice').size,
			MessagesSeen: bot.messagesSent,
			CommandsRan: bot.commandsUsed,
		});
	});

	return router;
};
