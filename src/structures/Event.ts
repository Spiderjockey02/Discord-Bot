// Dependencies
import path from 'path';
import EgglordClient from 'src/base/Egglord';
import { EventConstructor } from 'src/types/Structure';

/**
 * Event structure
*/
export default class Event {
	conf: {
		name: string
		category: string
		child?: string
	};

	constructor({ name, dirname = '', child }: EventConstructor) {
		const category = (dirname ? dirname.split(path.sep)[dirname.split(path.sep).length - 1] : 'Other');
		this.conf = { name, category, child };
	}

	/**
	 * Function for receiving message.
	 * @param {bot} bot The instantiating client
	 * @param {message} message The message that ran the command
	 * @readonly
	*/
	async run(_client: EgglordClient, ..._args) {
		throw new Error(`Event: ${this.conf.name} does not have a run method`);
	}
}

