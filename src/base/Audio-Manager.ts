import type { Client } from 'discord.js';
import { Manager } from 'magmastream';
import config from '../config';

/**
 * Audio manager
 * @extends {Manager}
*/
export default class AudioManager extends Manager {
	constructor(client: Client) {
		super({
			nodes: config.LavalinkNodes,
			send: (id, payload) => {
				const guild = client.guilds.cache.get(id);
				if (guild) guild.shard.send(payload);
			},
			defaultSearchPlatform: 'youtube',
		});
	}
}