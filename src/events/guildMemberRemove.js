// Dependencies
const { MessageEmbed } = require('discord.js'),
	dateFormat = require('dateformat'),
	Event = require('../structures/Event');

module.exports = class guildMemberRemove extends Event {
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
			const modChannel = member.guild.channels.cache.get(settings.ModLogChannel);
			if (modChannel) require('../helpers/webhook-manager')(bot, modChannel.id, embed);
		}
	}
};
