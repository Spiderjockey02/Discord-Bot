// Dependencies
const { MessageEmbed } = require('discord.js');
const dateFormat = require('dateformat');

module.exports = async (bot, member) => {
	if (member.user.id == bot.user.id) return;

	// get server settings
	const settings = member.guild.settings;

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

	// Check if event guildMemberRemove is for logging
	if (settings.ModLogEvents.includes('GUILDMEMBERREMOVE') && settings.ModLog) {
		const embed = new MessageEmbed()
			.setDescription(`${member.toString()}\nMember count: ${member.guild.memberCount}`)
			.setColor(15158332)
			.setFooter(`ID: ${member.id}`)
			.setThumbnail(member.user.displayAvatarURL())
			.setAuthor('User left:', member.user.displayAvatarURL())
			.addField('Joined at:', `${dateFormat(member.joinedAt, 'ddd dd/mm/yyyy')} (${require('../helpers/time-converter.js').getDayDiff(member.joinedTimestamp, Date.now())} days ago)`)
			.setTimestamp();

		// Find channel and send message
		const modChannel = member.guild.channels.cache.get(settings.ModLogChannel);
		if (modChannel) modChannel.send(embed);
	}
};
