// Dependencies
const Event = require('../../structures/Event');

module.exports = class shardError extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, shardID) {
		bot.logger.debug(`Shard: ${shardID} is attempting to reconnect.`);
	}
};
