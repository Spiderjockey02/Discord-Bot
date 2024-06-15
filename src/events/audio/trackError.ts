import { Event, EgglordEmbed } from '../../structures';
import { Colors, TextBasedChannel } from 'discord.js';
import EgglordClient from '../../base/Egglord';
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
	 * @param {client} client The instantiating client
	 * @param {Player} player The player that's track errored
	 * @param {Track} track The track that errored
	 * @param {Object} payload The information about the error
	 * @readonly
	*/
	async run(client: EgglordClient, player: Player, _track: Track | UnresolvedTrack, payload: TrackExceptionEvent) {
		// when a track causes an error
		if (client.config.debug) client.logger.log(`Track error: ${payload.exception?.message} in guild: ${player.guild}.`);

		// reset player filter (might be the cause)
		player.filters.clearFilters();

		// send embed
		if (player.textChannel == null) return;
		const channel = client.channels.cache.get(player.textChannel) as TextBasedChannel;

		const embed = new EgglordEmbed(client, null)
			.setColor(Colors.Red)
			.setDescription(`An error has occured on playback: \`${payload.exception?.message}\``);
		channel.send({ embeds: [embed] });
	}
}