// when someone leaves a server
const Discord = require('discord.js');
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
	// Logging plugin
	if (settings.ModLog == false) return;
	// Check if event guildMemberAdd is for logging
	if (settings.ModLogEvents.includes('GUILDMEMBERREMOVE')) {
		const embed = new Discord.MessageEmbed()
			.setDescription(`${member.toString()}\nMember count: ${member.guild.memberCount}`)
			.setColor(15158332)
			.setFooter(`ID: ${member.id}`)
			.setThumbnail(member.user.displayAvatarURL())
			.setAuthor('User left:', member.user.displayAvatarURL())
			.addField('Joined at:', `${dateFormat(member.joinedAt, 'ddd dd/mm/yyyy')} (${require('../Utils/time.js').getDayDiff(member.joinedTimestamp, Date.now())} days ago)`)
			.setTimestamp();
		const modChannel = member.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel);
		if (modChannel) modChannel.send(embed);
		// log event in console
		bot.logger.log(`${member.user.tag} has left the server: [${member.guild.id}]`);
	}
};
