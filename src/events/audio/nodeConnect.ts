import { Node } from 'magmastream';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';

/**
 * Node connect event
 * @event AudioManager#NodeConnect
 * @extends {Event}
*/
export default class NodeConnect extends Event {
	constructor() {
		super({
			name: 'nodeConnect',
			dirname: __dirname,
			child: 'audioManager',
		});
	}

	/**
	 * Function for receiving event.
	 * @param {EgglordClient} client The instantiating client
	 * @param {Node} node The node that was connected
	 * @readonly
	*/
	async run(client: EgglordClient, node: Node) {
		client.logger.ready(`Lavalink node: ${node.options.identifier} has connected.`);
	}
}
