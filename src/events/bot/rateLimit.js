// Dependencies
const	Event = require('../../structures/Event');

module.exports = class RateLimit extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, rateLimitInfo) {
		if (bot.config.debug) console.log(rateLimitInfo);
	}
};
