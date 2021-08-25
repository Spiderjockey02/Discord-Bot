// Dependencies
const Event = require('../../structures/Event');

/**
 * Shard disconnect event
 * @event Egglord#ShardDisconnect
 * @extends {Event}
*/
class ShardDisconnect extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {CloseEvent} event The WebSocket close event
	 * @param {number} shardID The shard id that disconnected
	 * @readonly
	*/
	async run(bot, event, shardID) {
		bot.logger.error(`Shard: ${shardID} disconnected with error: ${event.reason}`);
	}
}

module.exports = ShardDisconnect;
