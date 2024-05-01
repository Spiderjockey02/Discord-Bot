import { EmbedBuilder, TextBasedChannel } from 'discord.js';
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
	 * @param {EgglordClient} client The instantiating client
	 * @param {Player} player The player that's queue ended
	 * @readonly
	*/
	async run(client: EgglordClient, player: Player) {
		// When the queue has finished
		player.timeout = setTimeout(() => {
			const guild = client.guilds.cache.get(player.guild);
			if (!guild) return;

			if (player.textChannel == undefined) return;
			const textChannel = guild.channels.cache.get(player.textChannel) as TextBasedChannel;


			// Don't leave channel if 24/7 mode is active
			// if (player.twentyFourSeven) return;
			const vcName = player.voiceChannel ? guild.channels.cache.get(player.voiceChannel)?.name ?? 'unknown' : 'unknown';

			// const vcName = client.channels.cache.get(player.voiceChannel)?.name ?? 'unknown';
			const embed = new EmbedBuilder()
				.setDescription(guild.translate('music/dc:INACTIVE', { VC: vcName }));

			textChannel?.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 15000 }));
			player.destroy();
		}, 180000);
	}
}
