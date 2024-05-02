import { Events, Snowflake } from 'discord.js';
import { Event } from '../../structures';
import EgglordClient from '../../base/Egglord';

/**
 * shard ready event
 * @extends {Event}
*/
export default class ShardReady extends Event {
	constructor() {
		super({
			name: Events.ShardReady,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @event Egglord#shardReady
	 * @param {client} client The instantiating client
	 * @param {?Set<Snowflake>} unavailableGuilds Set of unavailable guild ids, if any
	 * @readonly
	*/
	async run(client: EgglordClient, shardID: number, unavailableGuilds: Set<Snowflake>) {
		client.logger.ready(`Shard: ${shardID} has became ready with: ${unavailableGuilds?.size ?? 0} unavailable guilds.`);
	}
}