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
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {Interaction} interaction The interaction recieved (slash, button, context menu & select menu etc)
	 * @readonly
	*/
	async run(bot, interaction) {
		const channel = bot.channels.cache.get(interaction.channelId);

		// Make sure user is not on banned list
		if (interaction.user.cmdBanned && !interaction.isAutocomplete()) return interaction.reply({ embeds: [channel.error('events/message:BANNED_USER', null, true)] });

		// Check if it's message context menu
		if (interaction.isMessageContextMenuCommand() || interaction.isUserContextMenuCommand()) return bot.emit('clickMenu', interaction);

		// Check if it's autocomplete
		if(interaction.isAutocomplete()) return bot.emit('autoComplete', interaction);

		// Check if it's a button
		if (interaction.isButton()) return bot.emit('clickButton', interaction);

		// Check if it's a slash command
		if (interaction.isCommand()) return bot.emit('slashCreate', interaction);

		// Check if it's a modal submitted
		if (interaction.isModalSubmit()) return bot.emit('modalSubmit', interaction);

		// Check if it's a select menu submit
		if (interaction.isStringSelectMenu()) return bot.emit('SelectMenuSubmit', interaction);
	}
}

module.exports = InteractionCreate;
