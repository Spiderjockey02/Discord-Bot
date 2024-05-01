import { Node } from 'magmastream';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';

/**
 * Node error event
 * @event AudioManager#NodeError
 * @extends {Event}
*/
export default class NodeError extends Event {
	constructor() {
		super({
			name: 'nodeError',
			dirname: __dirname,
			child: 'audioManager',
		});
	}

	/**
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {Node} node The node that was connected
	 * @param {Error} error The error that occured on the node
	 * @readonly
	*/
	async run(bot: EgglordClient, node: Node, error: Error) {
		bot.logger.error(`Lavalink node: '${node.options.identifier}', has error: '${error.message}'.`);
	}
}
