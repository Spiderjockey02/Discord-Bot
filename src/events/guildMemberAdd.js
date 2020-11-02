// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports = async (bot, member) => {
	if (member.user.id == bot.user.id) return;
	// get server settings
	let settings;
	try {
		settings = await bot.getGuild(member.guild);
	} catch (e) {
		console.log(e);
	}
	// welcome plugin (check for anti-raid plugin too)
	if (settings.welcomePlugin == true) {
		// anti-raid is disabled so just run like normal
		if (settings.welcomeRaidConnect == false) {
			const channel = member.guild.channels.cache.find(c => c.id == settings.welcomeMessageChannel);
			if (channel) channel.send(settings.welcomeMessageText.replace('{user}', member.user).replace('{server}', member.guild.name)).catch(e => bot.logger.error(e.message));
			// Send private message to user
			if (settings.welcomePrivateToggle == true) {
				member.send(settings.welcomePrivateText.replace('{user}', member.user).replace('{server}', member.guild.name)).catch(e => bot.logger.error(e.message));
			}
			// Add role to user
			if (settings.welcomeRoleToggle == true) {
				for (let i = 0; i < settings.welcomeRoleGive.length; i++) {
					if (member.guild.roles.cache.find(role => role.id == settings.welcomeRoleGive[i])) {
						member.roles.add(member.guild.roles.cache.find(role => role.id == settings.welcomeRoleGive[i]));
					}
				}
			}
		}
	}
	// Logging plugin
	if (settings.ModLog == false) return;
	// Check if event guildMemberAdd is for logging
	if (settings.ModLogEvents.includes('GUILDMEMBERADD')) {
		const embed = new MessageEmbed()
			.setDescription(`${member.toString()}\nMember count: ${member.guild.memberCount}`)
			.setColor(3066993)
			.setFooter(`ID: ${member.id}`)
			.setThumbnail(member.user.displayAvatarURL())
			.setAuthor('User joined:', member.user.displayAvatarURL())
			.setTimestamp();
		const modChannel = member.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel);
		if (modChannel) modChannel.send(embed);
		// log event in console
		bot.logger.log(`${member.user.tag} has joined the server: [${member.guild.id}]`);
	}
};
