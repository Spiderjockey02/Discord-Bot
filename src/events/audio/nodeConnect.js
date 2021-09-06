// Dependencies
const	Event = require('../../structures/Event');

/**
 * Node connect event
 * @event AudioManager#NodeConnect
 * @extends {Event}
*/
class NodeConnect extends Event {
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
	async run(bot, node) {
		bot.logger.ready(`Lavalink node: ${node.options.identifier} has connected.`);
	}
}

module.exports = NodeConnect;
