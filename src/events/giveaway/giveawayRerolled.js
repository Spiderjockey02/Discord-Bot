// Dependencies
const { EmbedBuilder } = require('discord.js'),
	Event = require('../../structures/Event');

/**
 * Giveaway rerolled event
 * @event GiveawaysManager#GiveawayRerolled
 * @extends {Event}
*/
class GiveawayRerolled extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
			child: 'giveawaysManager',
		});
	}

	/**
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {Giveaway} giveaway The giveaway object
	 * @param {Array<GuildMember>} winners The member that added the reaction
	 * @readonly
	*/
	async run(bot, giveaway, winners) {
		if (bot.config.debug) bot.logger.log('giveaway has rerolled');

		// DM members that they have won
		for (const winner of winners) {
			try {
				const embed = new EmbedBuilder()
					.setAuthor({ name: 'Giveaway winner', iconURL: winner.user.displayAvatarURL() })
					.setThumbnail(bot.guilds.cache.get(giveaway.guildID).iconURL())
					.setDescription([
						`Prize: \`${giveaway.prize}\`.`,
						`Message link: [link](https://discord.com/channels/${giveaway.guildID}/${giveaway.channelID}/${giveaway.messageID}).`,
					].join('\n'));
				await winner.send({ embeds: [embed] });
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}
	}
}

module.exports = GiveawayRerolled;
