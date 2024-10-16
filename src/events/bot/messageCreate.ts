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
	async run(client: EgglordClient, message: Message) {
		// Should not respond to clients
		if (message.author.bot) return;

		// Add to the message statistics
		client.statistics.messages++;

		// Check if a command was ran
		client.commandManager.verify(message);

		// Guild-only systems
		if (message.inGuild()) {
			const settings = message.guild.settings;
			if (settings?.levelSystem) {
				if (await message.guild.levels?.validate(message)) {
					message.guild.levels?.calculateXP(message);
				}
			}
		}
	}
}

