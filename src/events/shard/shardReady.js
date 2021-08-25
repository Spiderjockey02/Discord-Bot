// Dependencies
const Event = require('../../structures/Event');

/**
 * shard ready event
 * @extends {Event}
*/
class ShardReady extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @event Egglord#shardReady
	 * @param {bot} bot The instantiating client
	 * @param {?Set<Snowflake>} unavailableGuilds Set of unavailable guild ids, if any
	 * @readonly
	*/
	async run(bot, shardID, unavailableGuilds) {
		bot.logger.ready(`Shard: ${shardID} has became ready with: ${(unavailableGuilds || new Set()).size} unavailable guilds.`);
	}
}

module.exports = ShardReady;
