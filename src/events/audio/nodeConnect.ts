import { Node } from 'magmastream';
import { Event, EgglordEmbed } from '@structures';
import EgglordClient from '../../base/Egglord';

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

		// Send to support server for logging
		if (!client.config.SupportServer.GuildChannel) return;

		// Make sure the channel is a Text-based channel
		const channel = client.channels.cache.get(client.config.SupportServer.GuildChannel);
		if (!channel?.isTextBased()) return;

		const embed = new EgglordEmbed(client, null)
			.setTitle(`Node Connected: ${node.options.identifier}`)
			.addFields({
				name: 'd',
				value: '',
			});

		channel.send({ embeds: [embed] });
	}
}
