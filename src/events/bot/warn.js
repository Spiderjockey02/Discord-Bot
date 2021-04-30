// Dependencies
const	Event = require('../../structures/Event');

module.exports = class Warn extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, info) {
		console.log('warn:');
		console.log(info);
	}
};
