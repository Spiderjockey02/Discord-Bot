// Dependencies
const	Event = require('../../structures/Event');

module.exports = class threadListSync extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, threads) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`${threads.size} thread(s) have now been synced in guild: ${threads.first().guildId}`);

		for (const thread of threads) {
			try {
				await thread.join();
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
};
