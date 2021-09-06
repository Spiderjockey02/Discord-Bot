// Dependencies
const	Event = require('../../structures/Event');

/**
 * Player destroy event
 * @event AudioManager#PlayerDestroy
 * @extends {Event}
*/
class PlayerDestroy extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {Node} node The node that was connected
	 * @readonly
	*/
	async run(bot, player) {
		if (bot.config.debug) bot.logger.log(`Lavalink player destroyed in guild: ${player.guild}.`);
	}
}

module.exports = PlayerDestroy;
