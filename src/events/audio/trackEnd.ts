import { Player, Track } from 'magmastream';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';

/**
 * Track end event
 * @event AudioManager#TrackEnd
 * @extends {Event}
*/
export default class TrackEnd extends Event {
	constructor() {
		super({
			name: 'trackEnd',
			dirname: __dirname,
			child: 'audioManager',
		});
	}

	/**
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {Player} player The player that's track ended
	 * @param {Track} track The track that ended
	 * @readonly
	*/
	async run(_bot: EgglordClient, player: Player, track: Track) {
		// when track finishes add to previous songs array
		player.addPreviousSong(track);
	}
}
