const express = require('express');
const app = express();
const port = 3000;

module.exports = bot => {
	app.get('/', (req, res) => {
		res.status(200).json({
			guildCount: bot.guilds.cache.size,
			userCount: bot.users.cache.size,
			uptime: process.uptime() * 1000,
			commandCount: bot.commands.size,
			memoryUsed: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
			textChannels: bot.channels.cache.filter(channel => channel.type === 'text').size,
			voiceChannels: bot.channels.cache.filter(channel => channel.type === 'voice').size,
		});
	});

	app.listen(port, () => {
		bot.logger.ready(`Statistics API has loaded on port:${port}`);
	});
};
