// Dependencies
const	Event = require('../../structures/Event');

/**
 * apiRequest event
 * @event Egglord#apiRequest
 * @extends {Event}
*/
class APIRequest extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {APIRequest} request The debug information
	 * @readonly
	*/
	async run(bot, request) {
		bot.requests[request.route] ? bot.requests[request.route] += 1 : bot.requests[request.route] = 1;
	}
}

module.exports = APIRequest;
