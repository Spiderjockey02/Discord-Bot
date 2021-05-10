// Dependencies
const Event = require('../../structures/Event');

module.exports = class ticketClose extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, giveaway, member, reaction) {
		if (bot.config.debug) bot.logger.log(`${reaction.toString()} added even though giveaway has finished`);
	}
};
