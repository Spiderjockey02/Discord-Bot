// Dependencies
const Event = require('../../structures/Event');

module.exports = class shardReady extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, shardID, unavailableGuilds) {
		bot.logger.ready(`Shard: ${shardID} has became ready with: ${(unavailableGuilds || new Set()).size} unavailable guilds.`);
	}
};
