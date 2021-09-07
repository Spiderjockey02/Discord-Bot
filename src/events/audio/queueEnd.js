// Dependencies
const { MessageEmbed } = require('discord.js'),
	Event = require('../../structures/Event');

/**
 * Queue end event
 * @event AudioManager#QueueEnd
 * @extends {Event}
*/
class QueueEnd extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {Player} player The player that's queue ended
	 * @readonly
	*/
	async run(bot, player) {
		// When the queue has finished
		player.timeout = setTimeout(() => {

			// Don't leave channel if 24/7 mode is active
			if (player.twentyFourSeven) return;
			const vcName = bot.channels.cache.get(player.voiceChannel)?.name ?? 'unknown';
			const embed = new MessageEmbed()
				.setDescription(bot.guilds.cache.get(player.guild).translate('music/dc:INACTIVE', { VC: vcName }));

			bot.channels.cache.get(player.textChannel)?.send({ embeds: [embed] }).then(m => m.timedDelete({ timeout: 15000 }));
			player.destroy();
		}, 180000);
	}
}

module.exports = QueueEnd;
