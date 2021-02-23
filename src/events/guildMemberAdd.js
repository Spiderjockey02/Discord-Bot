// Dependencies
const { MessageEmbed } = require('discord.js');

module.exports = async (bot, member) => {
	if (member.user.id == bot.user.id) return;

	// Get server settings
	const settings = member.guild.settings;

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

	// serverstats
	if (settings.ServerStats) {
		const membercache = member.guild.members.cache;
		// update bot stats
		if (settings.ServerStatsBot) {
			const botChannel = member.guild.channels.cache.find(c => c.id == settings.ServerStatsBotChannel);
			if (botChannel) {
				await botChannel.setName(`Total bots: ${membercache.filter(m => m.user.bot).size}`).catch(e => console.log(e));
			}
		}
		// update user stats (total member count)
		if (settings.ServerStatsUser) {
			const userChannel = member.guild.channels.cache.find(c => c.id == settings.ServerStatsUserChannel);
			if (userChannel) {
				await userChannel.setName(`Total users: ${membercache.size}`).catch(e => console.log(e));
			}
		}
		if (settings.ServerStatsHuman) {
			const humanChannel = member.guild.channels.cache.find(c => c.id == settings.ServerStatsHumanChannel);
			if (humanChannel) {
				await humanChannel.setName(`Total humans: ${membercache.filter(m => !m.user.bot).size}`).catch(e => console.log(e));
			}
		}
	}

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
		if (modChannel) modChannel.send(embed);
	}
};
