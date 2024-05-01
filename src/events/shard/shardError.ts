import Event from 'src/structures/Event';
import EgglordClient from 'src/base/Egglord';
import { Events } from 'discord.js';

/**
 * Shard error event
 * @event Egglord#ShardError
 * @extends {Event}
*/
export default class ShardError extends Event {
	constructor() {
		super({
			name: Events.ShardError,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Error} error The error encountered
	 * @param {number} shardID The shard id that disconnected
	 * @readonly
	*/
	async run(client: EgglordClient, error: Error, shardID: number) {
		client.logger.error(`Shard: ${shardID} encounted error: ${error}`);
	}
}
