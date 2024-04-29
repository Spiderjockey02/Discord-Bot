// Dependencies
import path from "path";

/**
 * Event structure
 * @abstract
 */
export default class Event {
	conf: {
		name: string 
		category: string 
		child?: string
	}

	constructor(name: string, {
		dirname = false,
		child = undefined,
	}) {
		const category = (dirname ? dirname.split(path.sep)[parseInt(dirname.split(path.sep).length - 1, 10)] : 'Other');
		this.conf = { name, category, child };
	}

	/**
	 * Function for receiving message.
	 * @param {bot} bot The instantiating client
	 * @param {message} message The message that ran the command
	 * @readonly
	*/
	// eslint-disable-next-line no-unused-vars
	async run() {
		throw new Error(`Event: ${this.conf.name} does not have a run method`);
	}
}

