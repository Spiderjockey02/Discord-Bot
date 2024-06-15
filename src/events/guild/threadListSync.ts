import { Event } from '../../structures';
import { Collection, Events, Snowflake, ThreadChannel } from 'discord.js';
import EgglordClient from '../../base/Egglord';

/**
 * Thread list sync event
 * @event Egglord#ThreadListSync
 * @extends {Event}
*/
export default class ThreadListSync extends Event {
	constructor() {
		super({
			name: Events.ThreadListSync,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Collection<Snowflake, ThreadChannel>} threads The threads that were synced
	 * @readonly
	*/
	async run(client: EgglordClient, threads: Collection<Snowflake, ThreadChannel>) {
		// For debugging
		client.logger.debug(`${threads.size} thread(s) have now been synced in guild: ${threads.first()?.guildId}`);

		for (const thread of threads) {
			try {
				thread.join();
			} catch (err) {
				client.logger.error(`Event: '${this.conf.name}' has error: ${err}.`);
			}
		}
	}
}

