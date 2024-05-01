import { Player } from 'magmastream';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';

/**
 * Player destroy event
 * @event AudioManager#PlayerDestroy
 * @extends {Event}
*/
export class PlayerDestroy extends Event {
	constructor() {
		super({
			name: 'playerDestroy',
			dirname: __dirname,
			child: 'audioManager',
		});
	}

	/**
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {Player} player The player that was destroyed
	 * @readonly
	*/
	async run(bot: EgglordClient, player: Player) {
		if (bot.config.debug) bot.logger.log(`Lavalink player destroyed in guild: ${player.guild}.`);
	}
}
