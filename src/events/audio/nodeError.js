// Dependencies
const	Event = require('../../structures/Event');

/**
 * Node error event
 * @event AudioManager#NodeError
 * @extends {Event}
*/
class NodeError extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {Node} node The node that was connected
	 * @readonly
	*/
	async run(bot, node, error) {
		bot.logger.error(`Lavalink node: '${node.options.identifier}', has error: '${error.message}'.`);
	}
}

module.exports = NodeError;
