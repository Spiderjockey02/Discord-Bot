import { Events } from 'discord.js';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';

/**
 * Raw event
 * @event Egglord#Raw
 * @extends {Event}
*/
export default class Raw extends Event {
	constructor() {
		super({
			name: Events.Raw,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {data} data The raw data from discord itself
	 * @readonly
	*/
	async run(client: EgglordClient, data: any) {
		// Used for the music plugin
		client.audioManager?.updateVoiceState(data);
	}
}
