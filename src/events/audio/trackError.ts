import Event from 'src/structures/Event';
import { EmbedBuilder } from 'discord.js';
import EgglordClient from 'src/base/Egglord';
import { Player, Track, TrackExceptionEvent, UnresolvedTrack } from 'magmastream';

/**
 * Track error event
 * @event AudioManager#TrackError
 * @extends {Event}
*/
export default class TrackError extends Event {
	constructor() {
		super({
			name: 'trackError',
			dirname: __dirname,
			child: 'audioManager',
		});
	}

	/**
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {Player} player The player that's track errored
	 * @param {Track} track The track that errored
	 * @param {Object} payload The information about the error
	 * @readonly
	*/
	async run(bot: EgglordClient, player: Player, _track: Track | UnresolvedTrack, payload: TrackExceptionEvent) {
		// when a track causes an error
		if (bot.config.debug) bot.logger.log(`Track error: ${payload.exception?.message} in guild: ${player.guild}.`);

		// reset player filter (might be the cause)
		player.resetFilter();

		// send embed
		const embed = new EmbedBuilder()
			.setColor(15158332)
			.setDescription(`An error has occured on playback: \`${payload.exception?.message}\``);
		bot.channels.cache.get(player.textChannel)?.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 15000 }));
	}
}