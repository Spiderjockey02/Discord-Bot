// Dependencies
const Event = require('../../structures/Event');

module.exports = class shardError extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, error, shardID) {
		console.log(error);
		bot.logger.error(`Shard: ${shardID} encounted error: ${error}`);
	}
};
