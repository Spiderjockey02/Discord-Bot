import { Events } from 'discord.js';
import { Event } from '../../structures';
import EgglordClient from '../../base/Egglord';

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
		console.log(err);
		client.logger.error(`client encountered an error: ${err.message}.`);
	}
}
