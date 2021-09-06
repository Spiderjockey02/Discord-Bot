// Dependencies
const	Event = require('../../structures/Event');

/**
 * Track end event
 * @event AudioManager#TrackEnd
 * @extends {Event}
*/
class TrackEnd extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {Node} node The node that was connected
	 * @readonly
	*/
	async run(bot, player, track) {
		// when track finishes add to previous songs array
		player.addPreviousSong(track);
	}
}

module.exports = TrackEnd;
