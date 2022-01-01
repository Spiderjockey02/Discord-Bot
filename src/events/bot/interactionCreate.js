// Dependencies
const Event = require('../../structures/Event');

/**
 * Interaction create event
 * @event Egglord#InteractionCreate
 * @extends {Event}
*/
class InteractionCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {Interaction} interaction The interaction recieved (slash, button, context menu & select menu etc)
	 * @readonly
	*/
	async run(bot, interaction) {
		// The interaction is a slash command
		if (interaction.isCommand()) return bot.emit('slashCreate', interaction);

		// The interaction is a button
		if (interaction.isButton()) return bot.emit('clickButton', interaction);

		// the interaction is a context menu
		if (interaction.isContextMenu()) return bot.emit('clickMenu', interaction);

		// the interaction is an autocomplete field
		if (interaction.isAutocomplete()) return bot.emit('autoComplete', interaction);
	}
}

module.exports = InteractionCreate;
