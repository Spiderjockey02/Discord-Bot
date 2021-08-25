// Dependencies
const	Event = require('../../structures/Event');

/**
 * Ratelimit event
 * @event Egglord#RateLimit
 * @extends {Event}
*/
class RateLimit extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {object} RateLimitData Object containing the rate limit info
	 * @param {string} RateLimitData.route The route of the request relative to the HTTP endpoint
	 * @param {number} RateLimitData.timeout Time until this rate limit ends, in ms
	 * @readonly
	*/
	async run(bot, { route, timeout }) {
		if (bot.config.debug) bot.logger.error(`Rate limit: ${route} (Cooldown: ${timeout}ms)`);
	}
}

module.exports = RateLimit;
