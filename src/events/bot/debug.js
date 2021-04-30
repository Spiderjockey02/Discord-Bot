// Dependencies
const	Event = require('../../structures/Event');

module.exports = class Debug extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, info) {
		if (bot.config.debug) bot.logger.debug(info);
	}
};
