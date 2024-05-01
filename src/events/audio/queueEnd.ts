// Dependencies
import { EmbedBuilder } from 'discord.js';
import { Player } from 'magmastream';
import EgglordClient from 'src/base/Egglord';
import Event from 'src/structures/Event';

/**
 * Queue end event
 * @event AudioManager#QueueEnd
 * @extends {Event}
*/
export default class QueueEnd extends Event {
	constructor() {
		super({
			name: 'queueEnd',
			dirname: __dirname,
			child: 'audioManager',
		});
	}

	/**
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {Player} player The player that's queue ended
	 * @param {Track} track The track that just ended causing the queue to end aswell.
	 * @readonly
	*/
	async run(bot: EgglordClient, player: Player) {
		// When the queue has finished
		player.timeout = setTimeout(() => {

			// Don't leave channel if 24/7 mode is active
			if (player.twentyFourSeven) return;
			const vcName = bot.channels.cache.get(player.voiceChannel)?.name ?? 'unknown';
			const embed = new EmbedBuilder()
				.setDescription(bot.guilds.cache.get(player.guild).translate('music/dc:INACTIVE', { VC: vcName }));

			bot.channels.cache.get(player.textChannel)?.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 15000 }));
			player.destroy();
		}, 180000);
	}
}
