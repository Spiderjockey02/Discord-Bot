// Dependencies
const	Event = require('../../structures/Event');

/**
 * Thread list sync event
 * @event Egglord#ThreadListSync
 * @extends {Event}
*/
class ThreadListSync extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {Collection<Snowflake, ThreadChannel>} threads The threads that were synced
	 * @readonly
	*/
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
}

module.exports = ThreadListSync;
