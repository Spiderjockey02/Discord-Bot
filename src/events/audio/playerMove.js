// Dependencies
const { MessageEmbed } = require('discord.js'),
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
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {Player} player The player that moved Voice channels
	 * @param {VoiceChannel} currentChannel The player before the move
	 * @param {VoiceChannel} newChannel The player after the move
	 * @readonly
	*/
	async run(bot, player, currentChannel, newChannel) {
		// Voice channel updated
		if (!newChannel) {
			const embed = new MessageEmbed()
				.setDescription(bot.guilds.cache.get(player.guild).translate('music/dc:KICKED'));
			bot.channels.cache.get(player.textChannel)?.send({ embeds: [embed] });
			player.destroy();
		} else {
			await player.setVoiceChannel(newChannel);
			player.pause(true);
			await bot.delay(1000);
			player.pause(false);
		}
	}
}

module.exports = PlayerMove;
