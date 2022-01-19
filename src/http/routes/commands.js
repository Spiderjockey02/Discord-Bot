// Dependencies
const express = require('express'),
	router = express.Router();

// Command page
module.exports = (bot) => {
	// List of all commands
	router.get('/', (req, res) => {

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
		res.status(200).json({ categories });
	});

	// JSON view of all commands
	router.get('/json', (req, res) => {

		res.status(200).json([...bot.commands]);
	});

	// Show information on a particular command
	router.get('/:command', (req, res) => {

		// check if command exists
		if (bot.commands.get(req.params.command) || bot.commands.get(bot.aliases.get(req.params.command))) {
			const command = bot.commands.get(req.params.command) || bot.commands.get(bot.aliases.get(req.params.command));
			res.status(200).json({ command });
		} else {
			res.status(400).json({ error: 'Invalid command!' });
		}
	});

	return router;
};
