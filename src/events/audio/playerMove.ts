import { EgglordEmbed, Event } from '../../structures';
import { GuildTextBasedChannel } from 'discord.js';
import EgglordClient from '../../base/Egglord';
import { Player } from 'magmastream';
import { setTimeout } from 'timers/promises';

/**
 * Player move event
 * @event AudioManager#PlayerMove
 * @extends {Event}
*/
export default class PlayerMove extends Event {
	constructor() {
		super({
			name: 'playerMove',
			dirname: __dirname,
			child: 'audioManager',
		});
	}

	/**
	 * Function for receiving event.
	 * @param {EgglordClient} client The instantiating client
	 * @param {Player} player The player that moved Voice channels
	 * @param {VoiceChannel} _oldChannel The player before the move
	 * @param {VoiceChannel} newChannel The player after the move
	 *
	 */
	async run(client: EgglordClient, player: Player, _oldChannel: string, newChannel: string) {

		// Voice channel updated
		if (!newChannel) {
			if (player.textChannel == null) return;
			const channel = client.channels.cache.get(player.textChannel) as GuildTextBasedChannel;

			const embed = new EgglordEmbed(client, channel.guild)
				.setDescription(client.languageManager.translate(channel.guild, 'music/dc:KICKED'));
			channel.send({ embeds: [embed] });
			player.destroy();
		} else {
			player.setVoiceChannel(newChannel);
			player.pause(true);
			await setTimeout(1000);
			player.pause(false);
		}
	}
}
