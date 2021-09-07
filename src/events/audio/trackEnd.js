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
	 * @param {Player} player The player that's track ended
	 * @param {Track} track The track that ended
	 * @readonly
	*/
	async run(bot, player, track) {
		// when track finishes add to previous songs array
		player.addPreviousSong(track);
	}
}

module.exports = TrackEnd;
