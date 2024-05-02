import { Events } from 'discord.js';
import { Event } from '../../structures';
import EgglordClient from '../../base/Egglord';

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
