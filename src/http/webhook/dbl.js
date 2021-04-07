// Dependencies
const DBL = require('dblapi.js');

module.exports = bot => {
	const dbl = new DBL(bot.config.DiscordBotLists.DBL_KEY, { webhookPort: 8000, webhookAuth: 'anyPassword' });

	dbl.webhook.on('ready', hook => {
		bot.logger.log(`DBL webhook running on: http://${hook.hostname}:${hook.port}${hook.path}`);
	});

	// This will just log errors if there are any
	dbl.on('error', err => {
		bot.logger.error(`An error has occured: ${err.message}`);
	});

	// When the webhook receives a vote
	dbl.webhook.on('vote', async vote => {
		// This will log the whole vote object to the console
		console.log(vote);
		// Handle the vote how you want
	});
};
