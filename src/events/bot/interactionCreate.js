// Dependencies
const { InteractionType } = require('discord.js'),
	Event = require('../../structures/Event');

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
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {Interaction} interaction The interaction recieved (slash, button, context menu & select menu etc)
	 * @readonly
	*/
	async run(bot, interaction) {

		// The interaction is a slash command or 'App'
		if (interaction.type == InteractionType.ApplicationCommand) {
			if (interaction.commandType == 1) {
				return bot.emit('slashCreate', interaction);
			} else if (interaction.commandType == 2) {
				return bot.emit('clickMenu', interaction);
			}
		}

		// The interaction is a button
		if (interaction.type == InteractionType.MessageComponent) return bot.emit('clickButton', interaction);

		// the interaction is an autocomplete field
		{if (interaction.type == InteractionType.ApplicationCommandAutocomplete) return bot.emit('autoComplete', interaction);}
	}
}

module.exports = InteractionCreate;
