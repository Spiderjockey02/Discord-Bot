import { Node } from 'magmastream';
import { Event } from '../../structures';
import EgglordClient from '../../base/Egglord';

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
