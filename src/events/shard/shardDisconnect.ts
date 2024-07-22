import { CloseEvent, Events } from 'discord.js';
import { Event } from '../../structures';
import EgglordClient from '../../base/Egglord';

/**
 * Shard disconnect event
 * @event Egglord#ShardDisconnect
 * @extends {Event}
*/
export default class ShardDisconnect extends Event {
	constructor() {
		super({
			name: Events.ShardDisconnect,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {CloseEvent} event The WebSocket close event
	 * @param {number} shardID The shard id that disconnected
	 * @readonly
	*/
	async run(client: EgglordClient, event: CloseEvent, shardID: number) {
		client.logger.error(`Shard: ${shardID} disconnected with error: ${event.reason}`);
	}
}