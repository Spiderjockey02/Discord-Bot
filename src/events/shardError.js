// Dependencies
const Event = require('../structures/Event');

module.exports = class shardError extends Event {
	async run(bot, error, shardID) {
		// LOG error event
		console.log(error);
		console.log(shardID);
	}
};
