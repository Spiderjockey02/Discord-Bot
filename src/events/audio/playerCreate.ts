import { Player } from 'magmastream';
import { Event } from '../../structures';
import EgglordClient from '../../base/Egglord';

/**
 * Player connect event
 * @event AudioManager#PlayerCreate
 * @extends {Event}
*/
export default class PlayerCreate extends Event {
	constructor() {
		super({
			name: 'playerCreate',
			dirname: __dirname,
			child: 'audioManager',
		});
	}

	/**
	 * Function for receiving event.
	 * @param {EgglordClient} client The instantiating client
	 * @param {Player} player The player that was connected
	 * @readonly
	*/
	async run(client: EgglordClient, player: Player) {
		if (client.config.debug) client.logger.log(`Lavalink player created in guild: ${player.guild}.`);
	}
}
