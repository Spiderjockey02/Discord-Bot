// Dependencies
const { MessageEmbed } = require('discord.js'),
	Event = require('../structures/Event');

module.exports = class guildMemberAdd extends Event {
	async run(bot, member) {
	// For debugging
		if (bot.config.debug) bot.logger.debug(`Member: ${member.user.tag} has been joined guild: ${member.guild.id}.`);

		if (member.user.id == bot.user.id) return;

		// Get server settings / if no settings then return
		const settings = member.guild.settings;
		if (Object.keys(settings).length == 0) return;

		// Check if event guildMemberAdd is for logging
		if (settings.ModLogEvents.includes('GUILDMEMBERADD') && settings.ModLog) {
			const embed = new MessageEmbed()
				.setDescription(`${member.toString()}\nMember count: ${member.guild.memberCount}`)
				.setColor(3066993)
				.setFooter(`ID: ${member.id}`)
				.setThumbnail(member.user.displayAvatarURL())
				.setAuthor('User joined:', member.user.displayAvatarURL())
				.setTimestamp();
			const modChannel = member.guild.channels.cache.get(settings.ModLogChannel);
			if (modChannel) require('../helpers/webhook-manager')(bot, modChannel.id, embed);
		}
	}
};
