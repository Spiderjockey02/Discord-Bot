import { TextBasedChannel } from 'discord.js';
import { Player, Track } from 'magmastream';
import { Event, EgglordEmbed } from '../../structures';
import EgglordClient from '../../base/Egglord';

/**
 * Track start event
 * @event AudioManager#TrackStart
 * @extends {Event}
*/
export default class TrackStart extends Event {
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
			const requester = track.requester;
			const member = client.guilds.cache.get(player.guild)?.members.cache.get(requester?.id ?? '');

			// When a song starts
			const embed = new EgglordEmbed(client, client.guilds.cache.get(player.guild) ?? null)
				.setColor(member?.displayHexColor ?? null)
				.setTitle('music/np:AUTHOR')
				.setDescription(`[${track.title}](${track.uri}) [${member}]`);

			const message = await channel.send({ embeds: [embed] });
			player.setNowPlayingMessage(message);
		}

		// clear timeout (for queueEnd event)
		if (player.timeout != null) return clearTimeout(player.timeout);
	}
}