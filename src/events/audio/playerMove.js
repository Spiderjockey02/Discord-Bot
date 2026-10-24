// Dependencies
const { EmbedBuilder } = require('discord.js'),
	Event = require('../../structures/Event');

/**
 * Player move event
 * @event AudioManager#PlayerMove
 * @extends {Event}
*/
class PlayerMove extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
			child: 'manager',
		});
	}

	/**
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {Player} player The player that moved Voice channels
	 * @param {VoiceChannel} oldChannel The player before the move
	 * @param {VoiceChannel} newChannel The player after the move
	 * @readonly
	*/
	async run(bot, player, oldChannel, newChannel) {
		// Voice channel updated
		if (!newChannel) {
			const embed = new EmbedBuilder()
				.setDescription(bot.guilds.cache.get(player.guild).translate('music/dc:KICKED'));
			bot.channels.cache.get(player.textChannel)?.send({ embeds: [embed] });
			player.destroy();
		} else {
			// The audio player stays subscribed to the connection, so playback carries on in the new channel
			try {
				await player.setVoiceChannel(newChannel);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}

module.exports = PlayerMove;
