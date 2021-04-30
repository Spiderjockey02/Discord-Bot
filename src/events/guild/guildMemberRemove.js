// Dependencies
const { MessageEmbed } = require('discord.js'),
	{ RankSchema } = require('../../database/models'),
	dateFormat = require('dateformat'),
	Event = require('../../structures/Event');

module.exports = class guildMemberRemove extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	// run event
	async run(bot, member) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Member: ${member.user.tag} has been left guild: ${member.guild.id}.`);

		if (member.user.id == bot.user.id) return;

		// Get server settings / if no settings then return
		const settings = member.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildMemberRemove is for logging
		if (settings.ModLogEvents.includes('GUILDMEMBERREMOVE') && settings.ModLog) {
			const embed = new MessageEmbed()
				.setDescription(`${member.toString()}\nMember count: ${member.guild.memberCount}`)
				.setColor(15158332)
				.setFooter(`ID: ${member.id}`)
				.setThumbnail(member.user.displayAvatarURL())
				.setAuthor('User left:', member.user.displayAvatarURL())
				.addField('Joined at:', `${dateFormat(member.joinedAt, 'ddd dd/mm/yyyy')} (${Math.round((new Date() - member.joinedAt) / 86400000)} day(s) ago)`)
				.setTimestamp();

			// Find channel and send message
			try {
				const modChannel = await bot.channels.fetch(settings.ModLogChannel).catch(() => bot.logger.error(`Error fetching guild: ${member.guild.id} logging channel`));
				if (modChannel && modChannel.guild.id == member.guild.id) bot.addEmbed(modChannel.id, embed);
			} catch (err) {
				bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
			}
		}

		// Remove member's rank
		try {
			await RankSchema.findOneAndRemove({ userID: member.user.id,	guildID: member.guild.id });
		} catch (err) {
			bot.logger.error(`Event: '${this.conf.name}' has error: ${err.message}.`);
		}
	}
};
