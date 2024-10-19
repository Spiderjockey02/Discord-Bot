import { EmbedBuilder } from 'discord.js';
import { Player } from 'magmastream';
import { Event } from '../../structures';
import EgglordClient from '../../base/Egglord';

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
			const textChannel = guild.channels.cache.get(player.textChannel);
			if (textChannel == undefined || !textChannel.isSendable()) return;

			// Don't leave channel if 24/7 mode is active
			// if (player.twentyFourSeven) return;
			const vcName = player.voiceChannel ? guild.channels.cache.get(player.voiceChannel)?.name ?? 'unknown' : 'unknown';

			const embed = new EmbedBuilder()
				.setDescription(client.languageManager.translate(guild, 'music/dc:INACTIVE', { VC: vcName }));

			textChannel?.send({ embeds: [embed] });
			player.destroy();
		}, 180000);
	}
}
