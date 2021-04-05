// Dependencies
const	Event = require('../structures/Event');

module.exports = class voiceStateUpdate extends Event {
	async run(bot, info) {
		console.log('warn:');
		console.log(info);
	}
};
