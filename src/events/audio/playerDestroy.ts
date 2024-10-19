import { Player } from 'magmastream';
import { Event } from '../../structures';
import EgglordClient from '../../base/Egglord';

/**
 * Player destroy event
 * @event AudioManager#PlayerDestroy
 * @extends {Event}
*/
export default class PlayerDestroy extends Event {
	constructor() {
		super({
			name: 'playerDestroy',
			dirname: __dirname,
			child: 'audioManager',
		});
	}

	/**
	 * Function for receiving event.
	 * @param {EgglordClient} client The instantiating client
	 * @param {Player} player The player that was destroyed
	 * @readonly
	*/
	async run(client: EgglordClient, player: Player) {
		client.logger.debug(`Lavalink player destroyed in guild: ${player.guild}.`);
	}
}
