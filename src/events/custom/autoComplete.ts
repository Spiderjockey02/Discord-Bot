import { AutocompleteInteraction } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { Event } from '../../structures';

/**
 * Auto-complete event
 * @event Egglord#autoComplete
 * @extends {Event}
*/
export default class AutoComplete extends Event {
	constructor() {
		super({
			name: 'autoComplete',
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {AutocompleteInteraction} interaction The button that was pressed
	 * @readonly
	*/
	async run(client: EgglordClient, interaction: AutocompleteInteraction<'cached'>) {
		// Make sure only play & search command trigger autoComplete
		switch (interaction.commandName) {
			case 'play':
				return client.commandManager.get('play')?.autocomplete(client, interaction);
			case 'radio':
				return client.commandManager.get('radio')?.autocomplete(client, interaction);
			case 'role':
				return client.commandManager.get('role-add')?.autocomplete(client, interaction);
			case 'help':
				return client.commandManager.get('help')?.autocomplete(client, interaction);
			case 'playlist':
				return client.commandManager.get('playlist')?.autocomplete(client, interaction);
			case 'animal':
				return client.commandManager.get('animal')?.autocomplete(client, interaction);
			case 'reload':
				return client.commandManager.get(`reload-${interaction.options.getSubcommand()}`)?.autocomplete(client, interaction);
			case 'settings':
				return client.commandManager.get('settings-logs')?.autocomplete(client, interaction);
			case 'weather':
				return client.commandManager.get('weather')?.autocomplete(client, interaction);
			default:
				interaction.respond([{ name: 'error', value: 'error fetching results' }]);
		}
	}
}

