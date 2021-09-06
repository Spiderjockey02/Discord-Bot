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
	 * @param {Node} node The node that was connected
	 * @readonly
	*/
	async run(bot, player, currentChannel, newChannel) {
		// Voice channel updated
		if (!newChannel) {
			const embed = new MessageEmbed()
				.setDescription(bot.guilds.cache.get(player.guild).translate('music/dc:KICKED'));
			const channel = bot.channels.cache.get(player.textChannel);
			if (channel) channel.send({ embeds: [embed] });
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
