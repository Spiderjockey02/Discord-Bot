import { Events } from 'discord.js';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';

/**
 * Debug event
 * @event Egglord#Debug
 * @extends {Event}
*/
export default class Debug extends Event {
	constructor() {
		super({
			name: Events.Debug,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {string} info The debug information
	 * @readonly
	*/
	async run(client: EgglordClient, info: string) {
		if (client.config.debug) client.logger.debug(info);
	}
}
