// Dependencies
const	Event = require('../../structures/Event');

/**
 * Debug event
 * @event Egglord#Debug
 * @extends {Event}
*/
class Debug extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {string} info The debug information
	 * @readonly
	*/
	async run(bot, info) {
		if (bot.config.debug) bot.logger.debug(info);
	}
}

module.exports = Debug;
