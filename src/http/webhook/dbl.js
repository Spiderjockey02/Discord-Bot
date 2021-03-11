const DBL = require('dblapi.js');
module.exports = bot => {
	const dbl = new DBL(bot.config.DiscordBotLists.DBL_KEY, { webhookPort: 8000, webhookAuth: 'anyPassword' });

	dbl.webhook.on('ready', hook => {
		console.log(`Webhook up and running at http://${hook.hostname}:${hook.port}${hook.path}`);
	});

	// This will just log errors if there are any
	dbl.on('error', e => {
		console.log(`Oops! ${e}`);
	});

	// When the webhook receives a vote
	dbl.webhook.on('vote', async vote => {
		// This will log the whole vote object to the console
		console.log(vote);
		// Get the Discord ID of the user who voted
		const userID = vote.user;
		// If the channel to send messages in exists, we send a message in it with the ID of the user who votes
		// if(channelForWebhooks) await channelForWebhooks.send(`User with ID \`${userID}\` just voted!`);
	});
};
