// Dependencies
const { MessageEmbed } = require('discord.js'),
	dateFormat = require('dateformat'),
	{ RankSchema } = require('../database/models'),
	Event = require('../structures/Event');

module.exports = class guildMemberRemove extends Event {
	async run(bot, member) {
		// For debugging
		if (bot.config.debug) bot.logger.debug(`Member: ${member.user.tag} has been left guild: ${member.guild.id}.`);

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
			const modChannel = await bot.channels.fetch(settings.ModLogChannel);
			if (modChannel && modChannel.guild.id == member.guild.id) bot.addEmbed(modChannel.id, embed);
		}

		// delete user's rank from database
		try {
			await RankSchema.findOneAndRemove({ guildID: member.guild.id, userID: member.user.id });
			if (bot.config.debug) bot.logger.debug(`Deleted ${member.user.tag} rank from guild: ${member.guild.id}.`);
		} catch (err) {
			bot.logger.error(`Event: '${this.name}' has error: ${err.message}.`);
		}
	}
};
