// Dependencies
const	Event = require('../../structures/Event');

/**
 * Player connect event
 * @event AudioManager#PlayerCreate
 * @extends {Event}
*/
class PlayerCreate extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {Player} player The player that was connected
	 * @readonly
	*/
	async run(bot, player) {
		if (bot.config.debug) bot.logger.log(`Lavalink player created in guild: ${player.guild}.`);
	}
}

module.exports = PlayerCreate;
