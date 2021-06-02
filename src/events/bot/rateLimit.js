// Dependencies
const	Event = require('../../structures/Event');

module.exports = class RateLimit extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, { route, timeout }) {
		if (bot.config.debug) bot.logger.error(`Rate limit: ${route} (Cooldown: ${timeout}ms)`);
	}
};
