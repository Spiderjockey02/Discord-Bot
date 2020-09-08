//Dependencies
const Discord = require('discord.js');
const dateFormat = require('dateformat')
const { timeFormat, getDurationDiff, getDayDiff } = require('../Utils/time');
module.exports = async (bot, member) => {
	if (member.user.id == bot.user.id) return  //makes sure its not this bot
	//get server settings
	let settings;
	try {
		settings = await bot.getGuild(member.guild)
	} catch (e) {
		console.log(e)
	}
	//Logging plugin
	if (settings.ModLog == false) return
	//Check if event guildMemberAdd is for logging
	if (settings.ModLogEvents.includes('GUILDMEMBERADD')) {
		var embed = new Discord.MessageEmbed()
			.setDescription(`${member.toString()}\nMember count: ${member.guild.memberCount}`)
			.setColor(3066993)
			.setFooter(`ID: ${member.id}`)
			.setThumbnail(member.user.displayAvatarURL())
			.setAuthor(`User left:`, member.user.displayAvatarURL())
			.addField("Joined at:", `${dateFormat(member.joinedAt, 'ddd dd/mm/yyyy')} (${require('../Utils/time.js').getDayDiff(member.joinedTimestamp, Date.now())} days ago)`)
			.setTimestamp()
		var channel = member.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel)
		if (channel) channel.send(embed)
	}
}
