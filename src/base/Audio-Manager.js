const { Manager } = require('lavacord'),
	{ LavalinkNodes: nodes } = require('../config');
require('../structures/Player');

/**
 * Audio manager
 * @extends {Manager}
*/
class AudioManager extends Manager {
	constructor(bot) {
		super({
			nodes: nodes,
            user: bot.user.id
		});
	}
}


module.exports = AudioManager;
