// Dependencies
const Event = require('../../structures/Event');

/**
 * Auto-complete event
 * @event Egglord#autoComplete
 * @extends {Event}
*/
class AutoComplete extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {AutocompleteInteraction} interaction The button that was pressed
	 * @readonly
	*/
	async run(bot, interaction) {
		// Make sure only play & search command trigger autoComplete
		switch (interaction.commandName) {
			case 'play':
				return bot.commands.get('play').autocomplete(bot, interaction);
			case 'radio':
				return bot.commands.get('radio').autocomplete(bot, interaction);
			case 'role':
				return bot.subCommands.get('role-add').autocomplete(bot, interaction);
			case 'help':
				return bot.commands.get('help').autocomplete(bot, interaction);
			case 'playlist':
				return bot.commands.get('playlist').autocomplete(bot, interaction);
			case 'animal':
				return bot.commands.get('animal').autocomplete(bot, interaction);
			case 'reload':
				return bot.subCommands.get(`reload-${interaction.options.getSubcommand()}`).autocomplete(bot, interaction);
			case 'settings':
				return bot.subCommands.get('settings-logs').autocomplete(bot, interaction);
			default:
				interaction.respond([{ name: 'error', value: 'error fetching results' }]);
		}
	}
}

module.exports = AutoComplete;
