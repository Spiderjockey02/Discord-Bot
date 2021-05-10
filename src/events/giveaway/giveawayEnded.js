// Dependencies
const { MessageEmbed } = require('discord.js'),
	Event = require('../../structures/Event');

module.exports = class ticketClose extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	async run(bot, giveaway, winners) {
		if (bot.config.debug) bot.logger.debug(`Giveaway just ended in guild: ${giveaway.guildID} with winners: ${winners.map(m => m.user.id)}.`);

		// DM members that they have won
		winners.forEach(async (member) => {
			try {
				const embed = new MessageEmbed()
					.setAuthor('Giveaway winner', member.user.displayAvatarURL())
					.setThumbnail(bot.guilds.cache.get(giveaway.guildID).iconURL())
					.setDescription([
						`Prize: \`${giveaway.prize}\`.`,
						`Message link: [link](https://discord.com/channels/${giveaway.guildID}/${giveaway.channelID}/${giveaway.messageID}).`,
					].join('\n'));
				await member.send(embed);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		});
	}
};
