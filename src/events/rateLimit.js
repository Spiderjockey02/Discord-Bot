// Dependencies
const	Event = require('../structures/Event');

module.exports = class rateLimit extends Event {
	async run(bot, rateLimitInfo) {
		if (bot.config.debug) console.log(rateLimitInfo);
	}
};
