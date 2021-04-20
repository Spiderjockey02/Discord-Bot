const express = require('express');
const app = express();
const port = 3000;

module.exports = bot => {
	app
		// Home page
		.get('/', (req, res) => {
			res.type('text/plain');
			res.send(`API server for ${bot.user.username}
				\n/statistics - For basic statistics of the bot
				\n/commands - Get full list of commands & categories
				\n/commands/:commandName - Get information on a specific command
				\n/guilds/:guilID - Get basic information of that guild
				\n/guilds/:guildID/members - Get full list of members in guild`);
		})
		// Statistics of the bot
		.use('/statistics', require('./statistics.js')(bot))
		// Command list
		.use('/commands', require('./commands.js')(bot))
		// Make sure web scrapers aren't used
		.use('/guilds', require('./guilds.js')(bot))
		.get('/robots.txt', function(req, res) {
			res.type('text/plain');
			res.send('User-agent: *\nallow: /\n\nUser-agent: *\ndisallow: /dashboard');
		})
		.get('*', async function(req, res) {
			res.send('No data here. Go away!');
		})
		// Run the server
		.listen(port, () => {
			bot.logger.ready(`Statistics API has loaded on port:${port}`);
		})
		.on('error', (err) => {
			bot.logger.error(`Error with starting HTTP API: ${err.message}`);
		});
};
