// Dependencies
const { MessageEmbed } = require('discord.js');
const dateFormat = require('dateformat');

module.exports = async (bot, member) => {
	if (member.user.id == bot.user.id) return;
	// get server settings
	let settings;
	try {
		settings = await bot.getGuild(member.guild);
	} catch (e) {
		console.log(e);
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

	// Logging plugin
	if (settings.ModLog == false) return;
	// Check if event guildMemberAdd is for logging
	if (settings.ModLogEvents.includes('GUILDMEMBERREMOVE')) {
		const embed = new MessageEmbed()
			.setDescription(`${member.toString()}\nMember count: ${member.guild.memberCount}`)
			.setColor(15158332)
			.setFooter(`ID: ${member.id}`)
			.setThumbnail(member.user.displayAvatarURL())
			.setAuthor('User left:', member.user.displayAvatarURL())
			.addField('Joined at:', `${dateFormat(member.joinedAt, 'ddd dd/mm/yyyy')} (${require('../helpers/time-converter.js').getDayDiff(member.joinedTimestamp, Date.now())} days ago)`)
			.setTimestamp();
		const modChannel = member.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel);
		if (modChannel) modChannel.send(embed);
		// log event in console
		bot.logger.log(`${member.user.tag} has left the server: [${member.guild.id}]`);
	}
};
