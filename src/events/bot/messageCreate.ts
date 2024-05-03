import { Events, Message } from 'discord.js';
import { Event } from '../../structures';
import EgglordClient from '../../base/Egglord';

/**
 * Message create event
 * @event Egglord#MessageCreate
 * @extends {Event}
*/
export default class MessageCreate extends Event {
	constructor() {
		super({
			name: Events.MessageCreate,
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Message} message The message that ran the command
	 * @readonly
	*/
	async run(_client: EgglordClient, message: Message<true>) {
		// Should not respond to clients
		if (message.author.client) return;

		// Level system
		const settings = message.guild.settings;
		if (settings?.levelSystem) message.guild.levels?.check(message);
	}
}

