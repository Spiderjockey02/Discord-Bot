// Dependencies
const Event = require('../../structures/Event');

/**
 * Shard reconnecting event
 * @event Egglord#Debug
 * @extends {Event}
*/
class ShardReconnecting extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {number} shardID The shard id that disconnected
	 * @readonly
	*/
	async run(bot, shardID) {
		bot.logger.debug(`Shard: ${shardID} is attempting to reconnect.`);
	}
}

module.exports = ShardReconnecting;
