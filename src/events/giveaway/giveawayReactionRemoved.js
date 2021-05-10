// Dependencies
const Event = require('../../structures/Event');

module.exports = class ticketClose extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, giveaway, member, reaction) {
		if (bot.config.debug) bot.logger.debug(`member: ${member.user.id} removed reaction ${reaction._emoji.name} to giveaway`);
	}
};
