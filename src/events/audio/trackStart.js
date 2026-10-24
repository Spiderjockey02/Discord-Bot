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
			child: 'manager',
		});
	}

	/**
   * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {Player} player The player that's track started
	 * @param {Track} track The track that started
	 * @readonly
	*/
	async run(bot, player, track) {
		// clear timeout (for queueEnd event)
		clearTimeout(player.timeout);
		player.timeout = null;

		// When a song starts
		const guild = bot.guilds.cache.get(player.guild);
		if (!guild) return;
		const requester = track.requester?.id ? guild.members.cache.get(track.requester.id) : null;
		const embed = new Embed(bot, guild)
			.setTitle('music/np:AUTHOR')
			.setDescription(`[${track.title}](${track.uri})${requester ? ` [${requester}]` : ''}`);
		if (requester) embed.setColor(requester.displayHexColor);

		bot.channels.cache.get(player.textChannel)?.send({ embeds: [embed] })
			.then(m => m.timedDelete({ timeout: (track.duration > 0 && track.duration < 6.048e+8) ? track.duration : 60000 }))
			.catch(err => bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`));
	}
}

module.exports = TrackStart;
