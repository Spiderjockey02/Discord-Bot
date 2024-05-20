const { Manager } = require('magmastream'),
	{ LavalinkNodes: nodes } = require('../config');
require('../structures/Player');

/**
 * Audio manager
 * @extends {Manager}
*/
class AudioManager extends Manager {
	constructor(bot) {
		super({
			nodes,
			send: (id, payload) => {
				const guild = bot.guilds.cache.get(id);
				if (guild) guild.shard.send(payload);
			},
			clientName: bot.user?.username ?? 'magmastream',
			defaultSearchPlatform: 'youtube',
		});
	}
}


module.exports = AudioManager;
