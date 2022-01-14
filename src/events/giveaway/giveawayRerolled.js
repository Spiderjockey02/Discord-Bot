// Dependencies
const { MessageEmbed } = require('discord.js'),
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
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {Giveaway} giveaway The giveaway object
	 * @param {Array<GuildMember>} winners The member that added the reaction
	 * @readonly
	*/
	async run(bot, giveaway, winners) {
		if (bot.config.debug) bot.logger.log('giveaway has rerolled');

		// DM members that they have won
		winners.forEach(async (member) => {
			try {
				const embed = new MessageEmbed()
					.setAuthor({ name: 'Giveaway winner', iconURL: member.user.displayAvatarURL() })
					.setThumbnail(bot.guilds.cache.get(giveaway.guildID).iconURL())
					.setDescription([
						`Prize: \`${giveaway.prize}\`.`,
						`Message link: [link](https://discord.com/channels/${giveaway.guildID}/${giveaway.channelID}/${giveaway.messageID}).`,
					].join('\n'));
				await member.send({ embeds: [embed] });
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		});
	}
}

module.exports = GiveawayRerolled;
