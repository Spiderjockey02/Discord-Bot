// Dependencies
const	{ Embed } = require('../../utils'),
	Event = require('../../structures/Event');

/**
 * Track start event
 * @event AudioManager#TrackStart
 * @extends {Event}
*/
class TrackStart extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
   * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {Player} player The player that's track started
	 * @param {Track} track The track that started
	 * @readonly
	*/
	async run(bot, player, track) {
		// When a song starts
		const embed = new Embed(bot, bot.guilds.cache.get(player.guild))
			.setColor(bot.guilds.cache.get(player.guild).members.cache.get(track.requester.id).displayHexColor)
			.setTitle('music/np:AUTHOR')
			.setDescription(`[${track.title}](${track.uri}) [${bot.guilds.cache.get(player.guild).members.cache.get(track.requester.id)}]`);

		bot.channels.cache.get(player.textChannel)?.send({ embeds: [embed] })
			.then(m => m.timedDelete({ timeout: (track.duration < 6.048e+8) ? track.duration : 60000 }));

		// clear timeout (for queueEnd event)
		if (player.timeout != null) return clearTimeout(player.timeout);
	}
}

module.exports = TrackStart;
