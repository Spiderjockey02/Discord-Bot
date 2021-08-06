// Dependencies
const Event = require('../../structures/Event');

module.exports = class interactionCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, interaction) {
		// The interaction is a slash command
		if (interaction.isCommand()) return bot.emit('slashCreate', interaction);

		// The interaction is a button
		if (interaction.isButton()) return bot.emit('clickButton', interaction);
	}
};
