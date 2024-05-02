import { Events } from 'discord.js';
import { Event } from '../../structures';
import EgglordClient from '../../base/Egglord';

/**
 * Raw event
 * @event Egglord#Raw
 * @extends {Event}
*/
export default class Raw extends Event {
	constructor() {
		super({
			name: Events.Raw as any,
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
