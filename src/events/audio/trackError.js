// Dependencies
const { MessageEmbed } = require('discord.js'),
	Event = require('../../structures/Event');

/**
 * Track error event
 * @event AudioManager#TrackError
 * @extends {Event}
*/
class TrackError extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {Player} player The player that's track errored
	 * @param {Track} track The track that errored
	 * @param {Object} payload The information about the error
	 * @readonly
	*/
	async run(bot, player, track, payload) {
		// when a track causes an error
		if (bot.config.debug) bot.logger.log(`Track error: ${payload.error} in guild: ${player.guild}.`);

		// reset player filter (might be the cause)
		player.resetFilter();

		// send embed
		const embed = new MessageEmbed()
			.setColor(15158332)
			.setDescription(`An error has occured on playback: \`${payload.error}\``);
		bot.channels.cache.get(player.textChannel)?.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 15000 }));
	}
}

module.exports = TrackError;
