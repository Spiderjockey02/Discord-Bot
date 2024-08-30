/* eslint-disable @typescript-eslint/no-unused-vars */
// Dependencies
import path from 'path';
import EgglordClient from '../base/Egglord';
import { ExtendedClientEvents, IEventAudio, IEventBase, IEventGiveaway, IEventGuild } from '../types/Structure';

/**
 * Event structure
*/
export default class Event {
	conf: IEventAudio | IEventGiveaway | IEventGuild;

	constructor({ name, dirname = '', child }: Partial<IEventBase> & { name: ExtendedClientEvents, child?: 'audioManager' | 'giveawayManager', dirname: string }) {
		const category = (dirname ? dirname.split(path.sep).pop() ?? 'Other' : 'Other');
		switch (child) {
			case 'audioManager':
				this.conf = { name, dirname, category, child } as IEventAudio;
				break;
			case 'giveawayManager':
				this.conf = { name, dirname, category, child } as IEventGiveaway;
				break;
			default:
				this.conf = { name, dirname, category, child: undefined } as IEventGuild;
				break;
		}
	}

	/**
	 * Function for receiving message.
	 * @param {client} client The instantiating client
	 * @param {message} message The message that ran the command
	 * @readonly
	*/
	async run(_client: EgglordClient, ..._args: any): Promise<any> {
		throw new Error(`Event: ${this.conf.name} does not have a run method`);
	}
}

