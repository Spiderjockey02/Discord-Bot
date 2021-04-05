// Dependencies
const { GiveawaySchema, RankSchema, WarningSchema } = require('../database/models'),
	{ MessageEmbed } = require('discord.js'),
	Event = require('../structures/Event');

module.exports = class guildDelete extends Event {
	async run(bot, guild) {
		bot.logger.log(`[GUILD LEAVE] ${guild.name} (${guild.id}) removed the bot.`);
		// Delete server settings
		await bot.DeleteGuild(guild);

		// Send message to channel that bot has left a server
		try {
			const embed = new MessageEmbed()
				.setTitle(`[GUILD LEAVE] ${guild.name}`)
				.setImage(guild.iconURL({ dynamic: true, size: 1024 }))
				.setDescription(`Guild ID: ${guild.id}\nOwner: ${guild.owner.user.tag}\nMemberCount: ${guild.memberCount}`);
			const modChannel = bot.channels.cache.get(bot.config.SupportServer.GuildChannel);
			if (modChannel) require('../helpers/webhook-manager')(bot, modChannel.id, embed);
		} catch (err) {
			bot.logger.error('Unable to fetch guild information.');
		}

		// Clean up database (delete all guild data)
		try {
			await RankSchema.deleteMany({
				guildID: guild.id,
			});
		} catch (err) {
			bot.logger.error(`Failed to delete Ranked data, error: ${err.message}`);
		}

		try {
			await GiveawaySchema.deleteMany({
				guildID: guild.id,
			});
		} catch (err) {
			bot.logger.error(`Failed to delete Giveaway data, error: ${err.message}`);
		}

		try {
			await WarningSchema.deleteMany({
				guildID: guild.id,
			});
		} catch (err) {
			bot.logger.error(`Failed to delete Warning data, error: ${err.message}`);
		}
	}
};
