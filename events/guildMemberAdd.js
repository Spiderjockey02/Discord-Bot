//Dependencies
const Discord = require('discord.js');

module.exports = async (bot, member) => {
	if (member.user.id == bot.user.id) return  //makes sure its not this bot
	//get server settings
	let settings;
	try {
		settings = await bot.getGuild(member.guild)
	} catch (e) {
		console.log(e)
	}
	bot.logger.log(`${member.user.tag} has joined the server: [${member.guild.id}]`)
	//welcome plugin (check for anti-raid plugin too)
	if (settings.welcomePlugin == true) {
		//anti-raid is disabled so just run like normal
		if (settings.welcomeRaidConnect == false) {
			var channel = member.guild.channels.cache.find(channel => channel.id == settings.welcomeChannel)
			if (channel) channel.send(settings.welcomeMessage.replace('{user}', member.user).replace('{server}', member.guild.name)).catch(e => bot.logger.error(e.message))
			//Send private message to user
			if (settings.welcomePvt == true) {
				member.send(settings.welcomePvtMessage.replace('{user}', member.user).replace('{server}', member.guild.name)).catch(e => bot.logger.error(e.message))
			}
			//Add role to user
			if (settings.welcomeRole == true) {
				for (var i = 0; i < settings.welcomeRoleGive.length; i++) {
					if (member.guild.roles.cache.find(role => role.id == settings.welcomeRoleGive[i])) {
						member.roles.add(member.guild.roles.cache.find(role => role.id == settings.welcomeRoleGive[i]))
					}
				}
			}
		}
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
			.setAuthor(`User joined:`, member.user.displayAvatarURL())
			.setTimestamp()
		var channel = member.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel)
		if (channel) channel.send(embed)
	}
}
