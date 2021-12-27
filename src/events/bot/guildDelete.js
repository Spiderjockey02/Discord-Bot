// Dependencies
const { GiveawaySchema, RankSchema, WarningSchema, ReactionRoleSchema } = require('../../database/models'),
	{ MessageEmbed, MessageAttachment } = require('discord.js'),
	{ Canvas } = require('canvacord'),
	Event = require('../../structures/Event');

/**
 * Guild delete event
 * @event Egglord#GuildDelete
 * @extends {Event}
*/
class GuildDelete extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for recieving event.
	 * @param {bot} bot The instantiating client
	 * @param {Guild} guild The guild that kicked the bot
	 * @readonly
	*/
	async run(bot, guild) {
		if (!bot.isReady() && !guild.available) return;
		bot.logger.log(`[GUILD LEAVE] ${guild.name} (${guild.id}) removed the bot.`);
		await bot.DeleteGuild(guild);

		// Send message to channel that bot has left a server
		let attachment;
		try {
			const embed = new MessageEmbed()
				.setTitle(`[GUILD LEAVE] ${guild.name}`);
			if (guild.icon == null) {
				const icon = await Canvas.guildIcon(guild.name ?? 'undefined', 128);
				attachment = new MessageAttachment(icon, 'guildicon.png');
				embed.setImage('attachment://guildicon.png');
			} else {
				embed.setImage(guild.iconURL({ dynamic: true, size: 1024 }));
			}
			embed.setDescription([
				`Guild ID: ${guild.id ?? 'undefined'}`,
				`Owner: ${bot.users.cache.get(guild.ownerId)?.tag}`,
				`MemberCount: ${guild?.memberCount ?? 'undefined'}`,
			].join('\n'));

			const modChannel = await bot.channels.fetch(bot.config.SupportServer.GuildChannel).catch(() => bot.logger.error(`Error fetching guild: ${guild.id} logging channel`));
			if (modChannel) bot.addEmbed(modChannel.id, [embed, attachment]);
		} catch (err) {
			bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}

		// Clean up database (delete all guild data)
		// Delete ranks from database
		try {
			const r = await RankSchema.deleteMany({
				guildID: guild.id,
			});
			if (r.deletedCount >= 1) bot.logger.log(`Deleted ${r.deletedCount} ranks.`);
		} catch (err) {
			bot.logger.error(`Failed to delete Ranked data, error: ${err.message}`);
		}

		// Delete giveaways from database
		try {
			const g = await GiveawaySchema.deleteMany({
				guildID: guild.id,
			});
			if (g.deletedCount >= 1) bot.logger.log(`Deleted ${g.deletedCount} giveaways.`);
		} catch (err) {
			bot.logger.error(`Failed to delete Giveaway data, error: ${err.message}`);
		}

		// Delete warnings from database
		try {
			const w = await WarningSchema.deleteMany({
				guildID: guild.id,
			});
			if (w.deletedCount >= 1) bot.logger.log(`Deleted ${w.deletedCount} warnings.`);
		} catch (err) {
			bot.logger.error(`Failed to delete Warning data, error: ${err.message}`);
		}

		// Delete reaction roles from database
		try {
			const rr = await ReactionRoleSchema.deleteMany({
				guildID: guild.id,
			});
			if (rr.deletedCount >= 1) bot.logger.log(`Deleted ${rr.deletedCount} reaction roles.`);
		} catch (err) {
			bot.logger.error(`Failed to delete Warning data, error: ${err.message}`);
		}

		// update bot's activity
		bot.SetActivity('WATCHING', [`${bot.guilds.cache.size} servers!`, `${bot.users.cache.size} users!`]);
	}
}

module.exports = GuildDelete;
