import { Node } from 'magmastream';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';

/**
 * Node disconnect event
 * @event AudioManager#NodeDisconnect
 * @extends {Event}
*/
export default class NodeDisconnect extends Event {
	constructor() {
		super({
			name: 'nodeDisconnect',
			dirname: __dirname,
			child: 'audioManager',
		});
	}

	/**
	 * Function for receiving event.
	 * @param {EgglordClient} client The instantiating client
	 * @param {Node} node The node that was connected
	 * @param {Object} reason The reason for the node disconnect
	 * @readonly
	*/
	async run(client: EgglordClient, node: Node, reason: { code?: number, reason?: string }) {
		client.logger.error(`Lavalink node: ${node.options.identifier} has disconnect, reason: ${(reason.reason) ? reason.reason : 'unspecified'}.`);
	}
}
