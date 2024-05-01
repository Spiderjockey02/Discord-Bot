import { Events } from 'discord.js';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';

/**
 * Error event
 * @event Egglord#Error
 * @extends {Event}
*/
export default class ErrorEvent extends Event {
	constructor() {
		super({
			name: Events.Error,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Error} error The error encountered
	 * @readonly
	*/
	async run(client: EgglordClient, err: Error) {
		console.log(err: any);
		client.logger.error(`client encountered an error: ${err.message}.`);
	}
}
