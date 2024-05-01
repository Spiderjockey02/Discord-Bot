import Event from 'src/structures/Event';
import { EmbedBuilder, TextBasedChannel } from 'discord.js';
import EgglordClient from 'src/base/Egglord';
import { Player } from 'magmastream';
import { sleep } from 'src/utils';

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
	 * @param {VoiceChannel} oldChannel The player before the move
	 * @param {VoiceChannel} newChannel The player after the move
	 * @readonly
	*/
	async run(client: EgglordClient, player: Player, _oldChannel: string, newChannel: string) {

		// Voice channel updated
		if (!newChannel) {
			if (player.textChannel == null) return;
			const channel = client.channels.cache.get(player.textChannel) as TextBasedChannel;

			const embed = new EmbedBuilder()
				.setDescription(client.guilds.cache.get(player.guild)?.translate('music/dc:KICKED'));
			channel.send({ embeds: [embed] });
			player.destroy();
		} else {
			player.setVoiceChannel(newChannel);
			player.pause(true);
			await sleep(1000);
			player.pause(false);
		}
	}
}
