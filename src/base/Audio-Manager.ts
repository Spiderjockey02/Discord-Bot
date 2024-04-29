import type { Client } from 'discord.js';
import { Manager } from 'magmastream'
import config from '../config'
require('../structures/Player');

/**
 * Audio manager
 * @extends {Manager}
*/
class AudioManager extends Manager {
	constructor(bot: Client) {
		super({
			nodes: config.LavalinkNodes,
			send: (id, payload) => {
				const guild = bot.guilds.cache.get(id);
				if (guild) guild.shard.send(payload);
			},
			clientName: bot.user?.username,
			defaultSearchPlatform: 'youtube',
		});
	}
}


module.exports = AudioManager;
