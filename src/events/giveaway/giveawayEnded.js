// Dependencies
const { EmbedBuilder } = require('discord.js'),
	Event = require('../../structures/Event');

/**
 * Giveaway ended event
 * @event GiveawaysManager#GiveawayEnded
 * @extends {Event}
*/
class GiveawayEnded extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
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
		if (bot.config.debug) bot.logger.debug(`Giveaway just ended in guild: ${giveaway.guildID} with winners: ${winners.map(m => m.user.id)}.`);

		// DM members that they have won
		winners.forEach(async (member) => {
			try {
				const embed = new EmbedBuilder()
					.setAuthor({ name: 'Giveaway winner', iconURL: member.user.displayAvatarURL() })
					.setThumbnail(bot.guilds.cache.get(giveaway.guildId).iconURL())
					.setDescription([
						`Prize: \`${giveaway.prize}\`.`,
						`Message link: [link](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId}).`,
					].join('\n'));
				await member.send({ embeds: [embed] });
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		});
	}
}

module.exports = GiveawayEnded;
