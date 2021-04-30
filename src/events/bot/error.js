// Dependencies
const	Event = require('../../structures/Event');

module.exports = class Error extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, err) {
		console.log(err);
		bot.logger.error(`Bot encountered an error: ${err.message}.`);
	}
};
