// Dependecies
const express = require('express'),
	router = express.Router();

// Command page
module.exports = function(bot) {
	// Show list of commands
	router.get('/', function(req, res) {
		if (bot.config.debug) bot.logger.debug(`IP: ${req.connection.remoteAddress.slice(7)} accessed \`/commands\`.`);

		// show list of commands
		const categories = bot.commands
			.map(c => c.help.category)
			.filter((v, i, a) => a.indexOf(v) === i)
			.sort((a, b) => a - b)
			.map(category => ({
				name: category,
				commands: bot.commands.filter(c => c.help.category === category)
					.sort((a, b) => a.help.name - b.help.name)
					.map(c => c.help.name),
			}));

		res.status(200).json({
			categories,
		});
	});

	// Show information on a particular command
	router.get('/:command', function(req, res) {
		if (bot.config.debug) bot.logger.debug(`IP: ${req.connection.remoteAddress.slice(7)} accessed \`/commands/${req.params.command}\`.`);
		if (bot.commands.get(req.params.command) || bot.commands.get(bot.aliases.get(req.params.command))) {
			const command = bot.commands.get(req.params.command) || bot.commands.get(bot.aliases.get(req.params.command));
			res.status(200).json({
				command,
			});
		} else {
			res.status(400).json({ error: 'Invalid command!' });
		}
	});

	return router;
};
