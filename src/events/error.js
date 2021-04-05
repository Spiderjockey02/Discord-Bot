// Dependencies
const	Event = require('../structures/Event');

module.exports = class error extends Event {
	async run(bot, err) {
		// LOG error event
		console.log('fdsdfdfs');
		console.log(err);
	}
};
