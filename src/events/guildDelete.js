// Dependencies
const { GiveawaySchema, RankSchema, WarningSchema, ReactionRoleSchema } = require('../database/models'),
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

			// Find channel and send message
			const modChannel = await bot.channels.fetch(bot.config.SupportServer.GuildChannel);
			if (modChannel) bot.addEmbed(modChannel.id, embed);
		} catch (err) {
			bot.logger.error('Unable to fetch guild information.');
		}

		// Clean up database (delete all guild data)
		// Delete ranks from database
		try {
			const r = await RankSchema.deleteMany({
				guildID: guild.id,
			});
			bot.logger.log(`Deleted ${r.deletedCount} ranks.`);
		} catch (err) {
			bot.logger.error(`Failed to delete Ranked data, error: ${err.message}`);
		}

		// Delete giveaways from database
		try {
			const g = await GiveawaySchema.deleteMany({
				guildID: guild.id,
			});
			bot.logger.log(`Deleted ${g.deletedCount} giveaways.`);
		} catch (err) {
			bot.logger.error(`Failed to delete Giveaway data, error: ${err.message}`);
		}

		// Delete warnings from database
		try {
			const w = await WarningSchema.deleteMany({
				guildID: guild.id,
			});
			bot.logger.log(`Deleted ${w.deletedCount} warnings.`);
		} catch (err) {
			bot.logger.error(`Failed to delete Warning data, error: ${err.message}`);
		}

		// Delete reaction roles from database
		try {
			const rr = await ReactionRoleSchema.deleteMany({
				guildID: guild.id,
			});
			bot.logger.log(`Deleted ${rr.deletedCount} reaction roles.`);
		} catch (err) {
			bot.logger.error(`Failed to delete Warning data, error: ${err.message}`);
		}
	}
};
