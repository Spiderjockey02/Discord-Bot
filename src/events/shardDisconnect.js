// Dependencies
const Event = require('../structures/Event');

module.exports = class shardDisconnect extends Event {
	async run(bot, event, id) {
		// LOG error event
		console.log(event);
		console.log(id);
	}
};
