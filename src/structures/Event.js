// Dependencies
const path = require('path');

/**
 * Event structure
 * @abstract
 */
class Event {
	constructor(bot, name, {
		dirname = false,
	}) {
		const category = (dirname ? dirname.split(path.sep)[parseInt(dirname.split(path.sep).length - 1, 10)] : 'Other');
		this.conf = { name, category };
	}

	/**
	 * Function for recieving message.
	 * @param {bot} bot The instantiating client
	 * @param {message} message The message that ran the command
	 * @readonly
	*/
	// eslint-disable-next-line no-unused-vars
	async run(...args) {
		throw new Error(`Event: ${this.name} does not have a run method`);
	}
}

module.exports = Event;
