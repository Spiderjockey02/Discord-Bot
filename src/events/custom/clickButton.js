// Dependencies
const	Event = require('../../structures/Event');

module.exports = class clickButton extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, button) {
		// buttons are only used for ticket embed and clear command
		console.log(button);
	}
};
