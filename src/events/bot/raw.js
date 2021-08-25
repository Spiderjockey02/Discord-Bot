// Dependencies
const	Event = require('../../structures/Event');

/**
 * Raw event
 * @event Egglord#Raw
 * @extends {Event}
*/
class Raw extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {data} data The raw data from discord itself
	 * @readonly
	*/
	async run(bot, data) {
		// Used for the music plugin
		bot.manager?.updateVoiceState(data);
	}
}

module.exports = Raw;
