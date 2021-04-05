// Dependencies
const	Event = require('../structures/Event');

module.exports = class debug extends Event {
	async run(bot, info) {
		if (bot.config.debug) bot.logger.debug(info);
	}
};
