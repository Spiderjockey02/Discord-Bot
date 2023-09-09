const { Manager } = require('magmastream'),
	{ LavalinkNodes: nodes } = require('../config');

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
		});
	}
}


module.exports = AudioManager;
