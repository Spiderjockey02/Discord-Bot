// Dependencies
const	Event = require('../../structures/Event');

/**
 * Node disconnect event
 * @event AudioManager#NodeDisconnect
 * @extends {Event}
*/
class NodeDisconnect extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {Node} node The node that was connected
	 * @param {Object} reason The reason for the node disconnect
	 * @readonly
	*/
	async run(bot, node, reason) {
		bot.logger.error(`Lavalink node: ${node.options.identifier} has disconnect, reason: ${(reason.reason) ? reason.reason : 'unspecified'}.`);
	}
}

module.exports = NodeDisconnect;
