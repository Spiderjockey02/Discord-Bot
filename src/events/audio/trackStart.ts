import { TextBasedChannel } from 'discord.js';
import { Player, Track } from 'magmastream';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';
import { delayedDelete } from 'src/utils/functions';

/**
 * Track start event
 * @event AudioManager#TrackStart
 * @extends {Event}
*/
class TrackStart extends Event {
	constructor() {
		super({
			name: 'trackStart',
			dirname: __dirname,
			child: 'audioManager',
		});
	}

	/**
   * Function for receiving event.
	 * @param {client} client The instantiating client
	 * @param {Player} player The player that's track started
	 * @param {Track} track The track that started
	 * @readonly
	*/
	async run(client: EgglordClient, player: Player, track: Track) {
		if (player.textChannel !== null) {
			const channel = client.channels.cache.get(player.textChannel) as TextBasedChannel;

			// When a song starts
			const embed = new Embed(client, client.guilds.cache.get(player.guild))
				.setColor(client.guilds.cache.get(player.guild)?.members.cache.get(track.requester.id)?.displayHexColor)
				.setTitle('music/np:AUTHOR')
				.setDescription(`[${track.title}](${track.uri}) [${client.guilds.cache.get(player.guild)?.members.cache.get(track.requester.id)}]`);

			channel.send({ embeds: [embed] }).then(m => delayedDelete(m, (track.duration < 6.048e+8) ? track.duration : 60000));
		}

		// clear timeout (for queueEnd event)
		if (player.timeout != null) return clearTimeout(player.timeout);
	}
}

module.exports = TrackStart;
